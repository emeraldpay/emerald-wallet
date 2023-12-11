import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';
import { Allowance } from '../../allowances/types';
import { StoredTransaction } from '../../txhistory/types';
import { Dispatcher, GetState, IExtraArgument } from '../../types';
import { TxAction } from '../types';

export interface Data<T extends WalletEntry> {
  action: TxAction;
  entry: T;
  initialAllowance?: Allowance;
  storedTx?: StoredTransaction;
}

export interface StoreProvider {
  dispatch: Dispatcher;
  getState: GetState;
  extra: IExtraArgument;
}

export type Handler<T = void> = () => T;
export type EntryHandler<E extends WalletEntry, R = void> = (data: Data<E>, storeProvider: StoreProvider) => Handler<R>;

export type GetFee = (blockchain: BlockchainCode) => Promise<void>;
