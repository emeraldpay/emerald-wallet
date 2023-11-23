import { BigAmount, CreateAmount } from '@emeraldpay/bigamount';
import { Satoshi } from '@emeraldpay/bigamount-crypto';
import { BitcoinEntry, EntryId, isBitcoinEntry } from '@emeraldpay/emerald-vault-core';
import {
  BitcoinRawTransactionInput,
  BitcoinRawTransactionOutput,
  InputUtxo,
  PersistentState,
  amountDecoder,
  amountFactory,
  blockchainIdToCode,
  workflow,
} from '@emeraldwallet/core';
import { IState, StoredTransaction } from '../../../..';
import { findEntry } from '../../../../accounts/selectors';
import { showError } from '../../../../screen/actions';
import { setPreparing, setTransaction, setTransactionFee } from '../../../actions';
import { EntryHandler } from '../../types';
import { getFee } from './fee';

function extractEntries(state: IState, { changes }: StoredTransaction): BitcoinEntry[] {
  const entryById = changes
    .filter(({ direction }) => direction === PersistentState.Direction.SPEND)
    .map(({ wallet }) => wallet)
    .filter((entryId): entryId is EntryId => entryId != null)
    .map((entryId) => findEntry(state, entryId))
    .filter((entry): entry is BitcoinEntry => entry != null && isBitcoinEntry(entry))
    .reduce<Map<EntryId, BitcoinEntry>>((carry, entry) => {
      if (carry.has(entry.id)) {
        return carry;
      }

      return carry.set(entry.id, entry);
    }, new Map());

  return [...entryById.values()];
}

interface ExtractedUtxo {
  restUtxo: InputUtxo[];
  txUtxo: InputUtxo[];
}

function extractUtxo(
  balances: PersistentState.Balance[],
  inputs: BitcoinRawTransactionInput[],
  factory: CreateAmount<BigAmount>,
): ExtractedUtxo {
  return balances
    .reduce<InputUtxo[]>(
      (carry, { address, utxo = [] }) => [
        ...carry,
        ...utxo.map(({ amount, txid, vout }) => ({
          address,
          txid,
          vout,
          value: factory(amount).encode(),
        })),
      ],
      [],
    )
    .reduce<ExtractedUtxo>(
      (carry, item) => {
        const input = inputs.find(({ txid, vout }) => txid === item.txid && vout === item.vout);

        if (input == null) {
          return { ...carry, restUtxo: [...carry.restUtxo, item] };
        }

        return {
          ...carry,
          txUtxo: [...carry.txUtxo, { ...item, sequence: input.sequence }],
        };
      },
      { restUtxo: [], txUtxo: [] },
    );
}

const restoreTransaction: EntryHandler<BitcoinEntry, Promise<void>> =
  ({ entry, metaType, storedTx }, { dispatch, getState, extra }) =>
  async () => {
    if (storedTx != null) {
      const blockchain = blockchainIdToCode(entry.blockchain);

      const rawTx = await extra.backendApi.getBtcTx(blockchain, storedTx.txId);

      if (rawTx != null) {
        const entries = extractEntries(getState(), storedTx);

        if (entries.length === 0) {
          dispatch(showError('Entries not found'));

          return;
        }

        /**
         * Currently creating bitcoin transaction supports only single entry
         */
        if (entries.length > 1) {
          dispatch(showError('Currently support only single entry'));

          return;
        }

        const balances = await Promise.all(
          entries
            .reduce<string[]>((carry, entry) => [...carry, ...entry.xpub.map(({ xpub }) => xpub)], [])
            .map((xPub) => extra.api.balances.list(xPub)),
        );

        const blockchainCode = blockchainIdToCode(storedTx.blockchain);

        const factory = amountFactory(blockchainCode) as CreateAmount<Satoshi>;

        const { restUtxo, txUtxo } = extractUtxo(balances.flat(), rawTx.vin, factory);

        if (rawTx.vin.length !== txUtxo.length) {
          dispatch(showError("Can't find all inputs in utxo"));

          return;
        }

        const [entry] = entries;

        const roleIndexes = await Promise.all(
          entry.xpub.map(async ({ role, xpub }) => ({
            role,
            index: await extra.api.xPubPos.getNext(xpub),
          })),
        );
        const entryAddresses = await Promise.all(
          roleIndexes.map(({ index, role }) => extra.api.vault.listEntryAddresses(entry.id, role, 0, index)),
        );

        const addresses = entryAddresses
          .flat()
          .filter(({ address }) =>
            rawTx.vout.some(({ scriptPubKey: { address: txAddress } }) => address === txAddress),
          );

        let outputs = rawTx.vout.filter(
          ({ scriptPubKey: { address: txAddress } }) => !addresses.some(({ address }) => address === txAddress),
        );

        if (outputs.length === 0) {
          /**
           * TODO Split to another PR
           * @see WALLET-379
           */
          const isAllChangeAddress = rawTx.vout.reduce(
            (carry, { scriptPubKey: { address: txAddress } }) =>
              carry && addresses.some(({ address, role }) => address === txAddress && role === 'change'),
            true,
          );

          if (isAllChangeAddress) {
            const mergedOutputs = rawTx.vout.reduce((carry, output) => {
              const {
                scriptPubKey: { address: txAddress },
              } = output;

              const addressOutput = carry.get(txAddress);

              return carry.set(
                txAddress,
                addressOutput == null ? output : { ...addressOutput, value: addressOutput.value + output.value },
              );
            }, new Map<string, BitcoinRawTransactionOutput>());

            outputs = [...mergedOutputs.values()];
          } else {
            outputs = rawTx.vout.filter(({ scriptPubKey: { address: txAddress } }) =>
              addresses.some(({ address, role }) => address === txAddress && role === 'change'),
            );
          }

          if (outputs.length === 0) {
            dispatch(showError("Can't find receiver address"));

            return;
          }
        }

        /**
         * Currently creating bitcoin transaction supports only single output (`to` address)
         */
        if (outputs.length > 1) {
          dispatch(showError('Currently supported only single receiver address'));

          return;
        }

        let changeAddress: string | undefined;

        if (addresses.length > 0) {
          changeAddress = addresses.find(({ role }) => role === 'change')?.address;
        }

        if (changeAddress == null) {
          const nextChangeAddresses = await Promise.all(
            roleIndexes
              .filter(({ role }) => role === 'change')
              .map(({ index, role }) => extra.api.vault.listEntryAddresses(entry.id, role, index, 1)),
          );

          [{ address: changeAddress }] = nextChangeAddresses.flat();
        }

        if (changeAddress == null) {
          dispatch(showError("Can't find change address"));

          return;
        }

        const [
          {
            scriptPubKey: { address },
            value: amount,
          },
        ] = outputs;

        const restoredTx = workflow.bitcoinTxFactory(metaType)(
          {
            changeAddress,
            blockchain: blockchainIdToCode(entry.blockchain),
            entryId: entry.id,
          },
          [...txUtxo, ...restUtxo],
        );

        const decoder = amountDecoder<Satoshi>(blockchainCode);

        const zeroAmount = factory(0);

        const fromBitcoin = (value: number): Satoshi =>
          factory(1).multiply(zeroAmount.units.top.multiplier).multiply(value);

        const inputAmount = txUtxo.reduce((carry, { value }) => carry.plus(decoder(value)), zeroAmount);
        const outputAmount = rawTx.vout.reduce((carry, { value }) => carry.plus(fromBitcoin(value)), zeroAmount);

        restoredTx.amount = fromBitcoin(amount);
        restoredTx.to = address;

        // Fee price assign should be after any other assignments because depends on their values
        restoredTx.feePrice = restoredTx.estimateVkbPrice(inputAmount.minus(outputAmount));

        dispatch(setTransaction(restoredTx.dump()));
      }
    }
  };

const recalculateFee: EntryHandler<BitcoinEntry> =
  ({ entry }, { dispatch, getState }) =>
  () => {
    const { fee, transaction } = getState().txStash;

    if (fee != null && transaction != null && workflow.isBitcoinPlainTx(transaction)) {
      const blockchain = blockchainIdToCode(entry.blockchain);

      const { range } = fee[blockchain] ?? {};

      if (range != null && workflow.isBitcoinFeeRange(range)) {
        const createTx = workflow.fromBitcoinPlainTx(transaction, {
          blockchain,
          changeAddress: transaction.changeAddress,
          entryId: entry.id,
        });

        const minFee = createTx.vkbPrice + createTx.vkbPrice * 0.1;
        const min = range.min > minFee ? range.min : minFee;

        createTx.feePrice = min;

        const maxFee = createTx.vkbPrice + createTx.vkbPrice * 0.5;
        const max = range.max > maxFee ? range.max : maxFee;

        const feeRange: workflow.BitcoinFeeRange = { min, max, std: min };

        dispatch(setTransaction(createTx.dump()));
        dispatch(setTransactionFee(feeRange));
      }
    }
  };

export const restoreBitcoinTransaction: EntryHandler<BitcoinEntry, Promise<void>> = (data, provider) => async () => {
  await Promise.all([getFee(data, provider)(), restoreTransaction(data, provider)()]);

  recalculateFee(data, provider)();

  provider.dispatch(setPreparing(false));
};
