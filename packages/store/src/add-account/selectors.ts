import { IState } from '../types';
import { INITIAL_STATE } from './reducer';
import { IAddAccountState } from './types';

export function isFulfilled (state: IAddAccountState, step: number): boolean {
  if (step === 0) {
    return state.blockchain != null;
  }
  if (step === 1) {
    return state.type != null;
  }
  return false;
}

export function getState (state: IState): IAddAccountState {
  return state.addAccount || INITIAL_STATE;
}
