import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { BitcoinRawTransaction, BlockchainCode, EthereumRawTransaction, workflow } from '@emeraldwallet/core';
import { StoredTransaction } from '../../txhistory/types';
import { Dispatcher, GetState, IExtraArgument } from '../../types';
import { TxAction } from '../types';

export interface Data<T extends WalletEntry> {
  action: TxAction;
  entry: T;
  storedTx?: StoredTransaction;
}

export interface DataProvider {
  getTxMetaType(rawTx: BitcoinRawTransaction | EthereumRawTransaction): workflow.TxMetaType;
}

export interface StoreProvider {
  dispatch: Dispatcher;
  getState: GetState;
  extra: IExtraArgument;
}

export type Handler<T = void> = () => T;

export type EntryHandler<E extends WalletEntry, R = void> = (
  data: Data<E>,
  dataProvider: DataProvider,
  storeProvider: StoreProvider,
) => Handler<R>;

export type GetFee = (blockchain: BlockchainCode) => Promise<void>;
