import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { Addressbook } from './persistentState';

export interface WalletApi {
  addressBook: Addressbook;
  vault: IEmeraldVault;
}
