import { StoredTransaction } from './types';
import { IState } from '../types';

export function transactionById(state: IState, id: string): StoredTransaction | undefined {
  return state.history.transactions.find((tx) => tx.txId === id);
}
