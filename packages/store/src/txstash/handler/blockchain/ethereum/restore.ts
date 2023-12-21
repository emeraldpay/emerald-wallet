import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  Blockchains,
  DecodedInput,
  EthereumRawTransaction,
  TokenRegistry,
  amountFactory,
  blockchainIdToCode,
  decodeData,
  toBigNumber,
  workflow,
} from '@emeraldwallet/core';
import { getTokens } from '../../../../application/selectors';
import { setPreparing, setTransaction, setTransactionFee } from '../../../actions';
import { getFee } from '../../../selectors';
import { EntryHandler } from '../../types';
import { fetchFee } from './fee';

export interface DataProvider {
  getTxMetaType(rawTx: EthereumRawTransaction): workflow.TxMetaType;
}

type EthereumHandler<R = void> = EntryHandler<EthereumEntry, R> extends (...args: infer A) => infer T
  ? (...args: [...args: A, dataProvider: DataProvider]) => T
  : never;

const restoreTx: EthereumHandler<Promise<void>> =
  ({ entry, storedTx }, { dispatch, getState, extra }, { getTxMetaType }) =>
  async () => {
    if (storedTx != null) {
      const blockchain = blockchainIdToCode(entry.blockchain);

      const rawTx = await extra.backendApi.getEthTx(blockchain, storedTx.txId);

      if (rawTx != null) {
        const tokenRegistry = new TokenRegistry(getState().application.tokens);

        const { from, gas, gasPrice, input, nonce, maxFeePerGas, maxPriorityFeePerGas, to, type, value } = rawTx;

        const { inputs, name } = decodeData(input);

        let dataAmount: DecodedInput | undefined;
        let dataFrom: DecodedInput | undefined;
        let dataTo: DecodedInput | undefined;

        switch (name) {
          case 'approve':
          case 'transfer': {
            [dataTo, dataAmount] = inputs;

            break;
          }
          case 'transferFrom': {
            [dataFrom, dataTo, dataAmount] = inputs;
          }
        }

        const factory = amountFactory(blockchain);

        let amount = factory(value).encode();
        let asset = Blockchains[blockchain].params.coinTicker as string;

        if (to != null && tokenRegistry.hasAddress(blockchain, to)) {
          asset = to;

          if (dataAmount != null) {
            amount = tokenRegistry.byAddress(blockchain, asset).getAmount(toBigNumber(dataAmount)).encode();
          }
        }

        const restoredTx: workflow.EthereumBasicPlainTx = {
          amount,
          asset,
          blockchain,
          from,
          type,
          gas: parseInt(gas, 16),
          gasPrice: gasPrice == null ? undefined : factory(gasPrice).encode(),
          maxGasPrice: maxFeePerGas == null ? undefined : factory(maxFeePerGas).encode(),
          meta: { type: getTxMetaType(rawTx) },
          nonce: parseInt(nonce, 16),
          priorityGasPrice: maxPriorityFeePerGas == null ? undefined : factory(maxPriorityFeePerGas).encode(),
          target: workflow.TxTarget.MANUAL,
          to: dataTo?.toString() ?? to,
          transferFrom: dataFrom?.toString(),
        };

        dispatch(setTransaction(restoredTx));
      }
    }
  };

const recalculateFee: EthereumHandler =
  ({ entry }, { dispatch, getState }) =>
  () => {
    const state = getState();

    const { fee, transaction } = state.txStash;

    if (fee != null && transaction != null && workflow.isEthereumPlainTx(transaction)) {
      const blockchain = blockchainIdToCode(entry.blockchain);

      const { range } = getFee(state, blockchain);

      if (range != null && workflow.isEthereumFeeRange(range)) {
        const createTx = workflow.fromEthereumPlainTx(transaction, new TokenRegistry(getTokens(state)));

        const zeroAmount = amountFactory(blockchain)(0) as WeiAny;

        const lowFee = createTx.gasPrice?.plus(createTx.gasPrice.multiply(0.1));
        const lowMaxFee = createTx.maxGasPrice?.plus(createTx.maxGasPrice.multiply(0.1)) ?? lowFee ?? zeroAmount;
        const lowPriorityFee = createTx.priorityGasPrice?.plus(createTx.priorityGasPrice.multiply(0.1)) ?? zeroAmount;

        const highFee = createTx.gasPrice?.plus(createTx.gasPrice.multiply(0.5));
        const highMaxFee = createTx.maxGasPrice?.plus(createTx.maxGasPrice.multiply(0.5)) ?? highFee ?? zeroAmount;
        const highPriorityFee = createTx.priorityGasPrice?.plus(createTx.priorityGasPrice.multiply(0.5)) ?? zeroAmount;

        const lowMaxGasPrice = range.lowMaxGasPrice.isGreaterThan(lowMaxFee)
          ? range.lowMaxGasPrice.number.toString()
          : lowMaxFee.number.toString();
        const highMaxGasPrice = range.highMaxGasPrice.isGreaterThan(highMaxFee)
          ? range.highMaxGasPrice.number.toString()
          : highMaxFee.number.toString();

        const lowPriorityGasPrice = range.lowPriorityGasPrice.isGreaterThan(lowPriorityFee)
          ? range.lowPriorityGasPrice.number.toString()
          : lowPriorityFee.number.toString();
        const highPriorityGasPrice = range.highPriorityGasPrice.isGreaterThan(highPriorityFee)
          ? range.highPriorityGasPrice.number.toString()
          : highPriorityFee.number.toString();

        createTx.gasPrice = lowFee;
        createTx.maxGasPrice = lowMaxFee;
        createTx.priorityGasPrice = lowPriorityFee;

        dispatch(setTransaction(createTx.dump()));

        const feeRange: workflow.EthereumFeeRange<string> = {
          lowMaxGasPrice,
          highMaxGasPrice,
          lowPriorityGasPrice,
          highPriorityGasPrice,
          stdMaxGasPrice: lowMaxGasPrice,
          stdPriorityGasPrice: lowPriorityGasPrice,
        };

        dispatch(setTransactionFee(feeRange));
      }
    }
  };

export const restoreEthereumTx: EthereumHandler<Promise<void>> = (data, storeProvider, dataProvider) => async () => {
  await Promise.all([fetchFee(data, storeProvider)(), restoreTx(data, storeProvider, dataProvider)()]);

  recalculateFee(data, storeProvider, dataProvider)();

  storeProvider.dispatch(setPreparing(false));
};
