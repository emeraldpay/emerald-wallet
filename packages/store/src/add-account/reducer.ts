import { isFulfilled } from './selectors';
import {
  ActionTypes,
  AddAccountAction,
  IAddAccountState,
  INextPageAction,
  ISetBlockchainAction,
  ISetTypeAction,
  ISetWalletAction
} from './types';

const TOTAL_STEPS = 4; // select wallet -> select chain -> select type -> action

export const INITIAL_STATE: IAddAccountState = {
  step: 0
};

function onNextPage (state: IAddAccountState, action: INextPageAction): IAddAccountState {
  if (state.step < TOTAL_STEPS && isFulfilled(state, state.step)) {
    return { ...state, step: state.step + 1 };
  }
  return state;
}

function onSetWallet (state: IAddAccountState, action: ISetWalletAction): IAddAccountState {
  return { ...INITIAL_STATE, walletId: action.value };
}

function onSetBlockchain (state: IAddAccountState, action: ISetBlockchainAction): IAddAccountState {
  return { ...state, blockchain: action.value };
}

function onSetType (state: IAddAccountState, action: ISetTypeAction): IAddAccountState {
  return { ...state, type: action.value };
}

export function reducer (
  state: IAddAccountState = INITIAL_STATE,
  action: AddAccountAction
): IAddAccountState {
  switch (action.type) {
    case ActionTypes.NEXT_PAGE:
      return onNextPage(state, action);
    case ActionTypes.START:
      return onSetWallet(state, action);
    case ActionTypes.SELECT_BLOCKCHAIN:
      return onSetBlockchain(state, action);
    case ActionTypes.SELECT_TYPE:
      return onSetType(state, action);
    default:
      return state;
  }
}
