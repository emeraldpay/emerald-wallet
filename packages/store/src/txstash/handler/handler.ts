import { WalletEntry, isBitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { EthereumRawTransaction, decodeData, isEthereumRawTransaction, workflow } from '@emeraldwallet/core';
import { TxAction } from '../types';
import {
  prepareBitcoinTransaction,
  prepareEthereumTransaction,
  restoreBitcoinTransaction,
  restoreEthereumTransaction,
} from './blockchain';
import { Data, Handler, StoreProvider } from './types';

function ethereumTxTypeSelector<T>(rawTx: EthereumRawTransaction, whenEther: T, whenContract: T): T {
  const { name: method } = decodeData(rawTx.input);

  return method == null ? whenEther : whenContract;
}

export function getHandler(data: Data<WalletEntry>, storeProvider: StoreProvider): Handler | undefined {
  const { action, entry } = data;

  if (isBitcoinEntry(entry)) {
    switch (action) {
      case TxAction.CANCEL:
        return restoreBitcoinTransaction(
          { ...data, entry },
          {
            getTxMetaType() {
              return workflow.TxMetaType.BITCOIN_CANCEL;
            },
          },
          storeProvider,
        );
      case TxAction.SPEEDUP:
        return restoreBitcoinTransaction(
          { ...data, entry },
          {
            getTxMetaType() {
              return workflow.TxMetaType.BITCOIN_SPEEDUP;
            },
          },
          storeProvider,
        );
      case TxAction.TRANSFER:
        return prepareBitcoinTransaction(
          { ...data, entry },
          {
            getTxMetaType() {
              return workflow.TxMetaType.BITCOIN_TRANSFER;
            },
          },
          storeProvider,
        );
    }
  } else {
    switch (action) {
      case TxAction.CANCEL:
        return restoreEthereumTransaction(
          { ...data, entry },
          {
            getTxMetaType(rawTx) {
              if (isEthereumRawTransaction(rawTx)) {
                return ethereumTxTypeSelector(
                  rawTx,
                  workflow.TxMetaType.ETHER_CANCEL,
                  workflow.TxMetaType.ERC20_CANCEL,
                );
              }

              throw new Error('Incorrect raw transaction provided');
            },
          },
          storeProvider,
        );
      case TxAction.SPEEDUP:
        return restoreEthereumTransaction(
          { ...data, entry },
          {
            getTxMetaType(rawTx) {
              if (isEthereumRawTransaction(rawTx)) {
                return ethereumTxTypeSelector(
                  rawTx,
                  workflow.TxMetaType.ETHER_SPEEDUP,
                  workflow.TxMetaType.ERC20_SPEEDUP,
                );
              }

              throw new Error('Incorrect raw transaction provided');
            },
          },
          storeProvider,
        );
      case TxAction.TRANSFER:
        return prepareEthereumTransaction(
          { ...data, entry },
          {
            getTxMetaType(rawTx) {
              if (isEthereumRawTransaction(rawTx)) {
                return ethereumTxTypeSelector(
                  rawTx,
                  workflow.TxMetaType.ETHER_TRANSFER,
                  workflow.TxMetaType.ERC20_TRANSFER,
                );
              }

              throw new Error('Incorrect raw transaction provided');
            },
          },
          storeProvider,
        );
    }
  }

  return undefined;
}
