import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { Addressbook, TxHistory, TxMetaStore, XPubPosition } from './persistentState';

export interface WalletApi {
  addressBook: Addressbook;
  txHistory: TxHistory;
  txMeta: TxMetaStore;
  vault: IEmeraldVault;
  xPubPos: XPubPosition;
}
