import { Map } from 'immutable';
import { IState } from '../types';
import { initialState } from './reducer';

function ledger (state: IState): Map<string, any> {
  return state.ledger || initialState;
}

export function getOffset (state: any): number {
  return ledger(state).get('hd').get('offset', 0);
}

export function getHdBase (state: any): string {
  return ledger(state).getIn(['hd', 'base']);
}

export function isConnected (state: any): boolean {
  return ledger(state).get('connected');
}

export function hasSelected (state: any): boolean {
  return getSelected(state) !== null;
}

export function getSelected (state: any): string {
  return ledger(state).get('selectedAddr');
}

export function getAddresses (state: any): string[] {
  return ledger(state).get('addresses').toJS();
}
