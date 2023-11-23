import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, workflow } from '@emeraldwallet/core';
import { StoredTransaction } from '../../txhistory/types';
import { Dispatcher, GetState, IExtraArgument } from '../../types';

export interface Data<T extends WalletEntry> {
  entry: T;
  metaType: workflow.TxMetaType;
}

export interface Provider {
  dispatch: Dispatcher;
  getState: GetState;
  extra: IExtraArgument;
}

export type Handler<T = void> = (storedTx: StoredTransaction | undefined) => T;
export type EntryHandler<E extends WalletEntry, R = void> = (data: Data<E>, provider: Provider) => Handler<R>;

export type GetFee = (blockchain: BlockchainCode) => Promise<void>;
