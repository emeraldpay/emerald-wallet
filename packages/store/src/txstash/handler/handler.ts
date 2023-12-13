import { WalletEntry, isBitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { EthereumRawTransaction, decodeData, isEthereumRawTransaction, workflow } from '@emeraldwallet/core';
import { TxAction } from '../types';
import {
  prepareBitcoinTx,
  prepareErc20ApproveTx,
  prepareEthereumTx,
  restoreBitcoinCancelTx,
  restoreBitcoinSpeedUpTx,
  restoreEthereumTx,
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
        return restoreBitcoinCancelTx({ ...data, entry }, storeProvider);
      case TxAction.SPEEDUP:
        return restoreBitcoinSpeedUpTx({ ...data, entry }, storeProvider);
      case TxAction.TRANSFER:
        return prepareBitcoinTx({ ...data, entry }, storeProvider);
    }
  } else {
    switch (action) {
      case TxAction.APPROVE:
        return prepareErc20ApproveTx({ ...data, entry }, storeProvider);
      case TxAction.CANCEL:
        return restoreEthereumTx({ ...data, entry }, storeProvider, {
          getTxMetaType(rawTx) {
            if (isEthereumRawTransaction(rawTx)) {
              return ethereumTxTypeSelector(rawTx, workflow.TxMetaType.ETHER_CANCEL, workflow.TxMetaType.ERC20_CANCEL);
            }

            throw new Error('Incorrect raw transaction provided');
          },
        });
      case TxAction.SPEEDUP:
        return restoreEthereumTx({ ...data, entry }, storeProvider, {
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
        });
      case TxAction.TRANSFER:
        return prepareEthereumTx({ ...data, entry }, storeProvider);
    }
  }

  return undefined;
}
