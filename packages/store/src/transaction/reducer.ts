import {
  ActionTypes,
  ITransactionState, TransactionAction
} from './types';

export const INITIAL_STATE: ITransactionState = {
  gasPrice: null
};

export function reducer (
  state: any = INITIAL_STATE,
  action: TransactionAction
): ITransactionState {
  switch (action.type) {
    default:
      return state;
  }
}
