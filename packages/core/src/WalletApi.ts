import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { Addressbook, TxHistory, TxMeta, XPubPosition } from './persistentState';

export interface WalletApi {
  addressBook: Addressbook;
  txHistory: TxHistory;
  txMeta: TxMeta;
  vault: IEmeraldVault;
  xPubPos: XPubPosition;
}
