import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { Addressbook, Allowances, Balances, Cache, TxHistory, TxMeta, XPubPosition } from './persistentState';

export interface WalletApi {
  addressBook: Addressbook;
  allowances: Allowances;
  balances: Balances;
  cache: Cache;
  txHistory: TxHistory;
  txMeta: TxMeta;
  vault: IEmeraldVault;
  xPubPos: XPubPosition;
}
