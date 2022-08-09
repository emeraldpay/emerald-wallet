import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { Addressbook, XPubPosition } from './persistentState';

export interface WalletApi {
  addressBook: Addressbook;
  vault: IEmeraldVault;
  xPubPos: XPubPosition;
}
