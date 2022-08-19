import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { Addressbook, TxHistory, XPubPosition } from './persistentState';

export interface WalletApi {
  addressBook: Addressbook;
  txHistory: TxHistory;
  vault: IEmeraldVault;
  xPubPos: XPubPosition;
}
