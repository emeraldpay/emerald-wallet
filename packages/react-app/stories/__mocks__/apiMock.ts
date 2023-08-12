import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { PersistentState, WalletApi } from '@emeraldwallet/core';
import {
  MemoryAddressBook,
  MemoryAllowances,
  MemoryBalances,
  MemoryCache,
  MemoryTxHistory,
  MemoryTxMeta,
  MemoryXPubPos,
} from './persistentStateMock';
import { MemoryVault } from './vaultMock';

export class MemoryApiMock {
  readonly addressBook = new MemoryAddressBook();
  readonly allowances = new MemoryAllowances();
  readonly balances = new MemoryBalances();
  readonly cache = new MemoryCache();
  readonly txHistory = new MemoryTxHistory();
  readonly txMeta = new MemoryTxMeta();
  readonly vault = new MemoryVault();
  readonly xPubPos = new MemoryXPubPos();
}

export class ApiMock implements WalletApi {
  readonly addressBook: PersistentState.Addressbook;
  readonly allowances: PersistentState.Allowances;
  readonly balances: PersistentState.Balances;
  readonly cache: PersistentState.Cache;
  readonly txHistory: PersistentState.TxHistory;
  readonly txMeta: PersistentState.TxMeta;
  readonly vault: IEmeraldVault;
  readonly xPubPos: PersistentState.XPubPosition;

  constructor(
    addressBook: PersistentState.Addressbook,
    allowances: PersistentState.Allowances,
    balances: PersistentState.Balances,
    cache: PersistentState.Cache,
    txHistory: PersistentState.TxHistory,
    txMeta: PersistentState.TxMeta,
    vault: IEmeraldVault,
    xPubPos: PersistentState.XPubPosition,
  ) {
    this.addressBook = addressBook;
    this.allowances = allowances;
    this.balances = balances;
    this.cache = cache;
    this.txHistory = txHistory;
    this.txMeta = txMeta;
    this.vault = vault;
    this.xPubPos = xPubPos;
  }
}
