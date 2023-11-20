import { WalletEntry, isBitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { workflow } from '@emeraldwallet/core';
import { TxAction } from '../types';
import {
  prepareBitcoinTransaction,
  prepareEthereumTransaction,
  restoreBitcoinTransaction,
  restoreEthereumTransaction,
} from './blockchain';
import { Handler, Provider } from './types';

export function getHandler(action: TxAction, entry: WalletEntry, provider: Provider): Handler | undefined {
  if (isBitcoinEntry(entry)) {
    switch (action) {
      case TxAction.CANCEL:
        return restoreBitcoinTransaction({ entry, metaType: workflow.TxMetaType.BITCOIN_CANCEL }, provider);
      case TxAction.SPEED_UP:
        return restoreBitcoinTransaction({ entry, metaType: workflow.TxMetaType.BITCOIN_SPEED_UP }, provider);
      case TxAction.TRANSFER:
        return prepareBitcoinTransaction({ entry, metaType: workflow.TxMetaType.BITCOIN_TRANSFER }, provider);
    }
  } else {
    switch (action) {
      case TxAction.CANCEL:
        return restoreEthereumTransaction({ entry, metaType: workflow.TxMetaType.ETHEREUM_CANCEL }, provider);
      case TxAction.SPEED_UP:
        return restoreEthereumTransaction({ entry, metaType: workflow.TxMetaType.ETHEREUM_SPEED_UP }, provider);
      case TxAction.TRANSFER:
        return prepareEthereumTransaction({ entry, metaType: workflow.TxMetaType.ETHEREUM_TRANSFER }, provider);
    }
  }

  return undefined;
}
