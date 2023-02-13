import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { Addressbook, Balances, TxHistory, TxMeta, XPubPosition } from './persistentState';

export interface WalletApi {
  addressBook: Addressbook;
  balances: Balances;
  txHistory: TxHistory;
  txMeta: TxMeta;
  vault: IEmeraldVault;
  xPubPos: XPubPosition;
}
