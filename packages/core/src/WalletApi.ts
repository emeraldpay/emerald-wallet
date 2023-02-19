import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { Addressbook, Balances, Cache, TxHistory, TxMeta, XPubPosition } from './persistentState';

export interface WalletApi {
  addressBook: Addressbook;
  balances: Balances;
  cache: Cache;
  txHistory: TxHistory;
  txMeta: TxMeta;
  vault: IEmeraldVault;
  xPubPos: XPubPosition;
}
