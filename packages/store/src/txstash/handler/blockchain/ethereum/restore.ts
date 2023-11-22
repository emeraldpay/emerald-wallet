import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  Blockchains,
  DecodedInput,
  TokenRegistry,
  amountFactory,
  blockchainIdToCode,
  decodeData,
  toBigNumber,
  workflow,
} from '@emeraldwallet/core';
import { setPreparing, setTransaction } from '../../../actions';
import { EntryHandler } from '../../types';
import { getFee } from './fee';

const restoreTransaction: EntryHandler<EthereumEntry, Promise<void>> =
  ({ entry, metaType, storedTx }, { dispatch, getState, extra }) =>
  async () => {
    if (storedTx != null) {
      const blockchain = blockchainIdToCode(entry.blockchain);

      const rawTx = await extra.backendApi.getEthTx(blockchain, storedTx.txId);

      if (rawTx != null) {
        const tokenRegistry = new TokenRegistry(getState().application.tokens);

        const { from, gas, gasPrice, input, maxFeePerGas, maxPriorityFeePerGas, to, type, value } = rawTx;

        let asset: string = Blockchains[blockchain].params.coinTicker;

        if (to != null && tokenRegistry.hasAddress(blockchain, to)) {
          asset = to;
        }

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

        const restoredTx: workflow.EthereumPlainTx = {
          asset,
          blockchain,
          from,
          type,
          amount: factory(toBigNumber(dataAmount?.toString() ?? value)).encode(),
          gas: parseInt(gas, 16),
          gasPrice: gasPrice == null ? undefined : factory(gasPrice).encode(),
          maxGasPrice: maxFeePerGas == null ? undefined : factory(maxFeePerGas).encode(),
          meta: { type: metaType },
          priorityGasPrice: maxPriorityFeePerGas == null ? undefined : factory(maxPriorityFeePerGas).encode(),
          target: workflow.TxTarget.MANUAL,
          to: dataTo?.toString() ?? to,
          transferFrom: dataFrom?.toString(),
        };

        dispatch(setTransaction(restoredTx));
      }
    }
  };

export const restoreEthereumTransaction: EntryHandler<EthereumEntry> = (data, provider) => () => {
  getFee(data, provider)();
  restoreTransaction(data, provider)().then(() => provider.dispatch(setPreparing(false)));
};
