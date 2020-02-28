import { Map } from 'immutable';
import { initialState } from './reducer';
import { ConnectionStatus, moduleName } from './types';

function conn (state: any): Map<string, any> {
  return state[moduleName] || initialState;
}
export function isOffline (state: any): boolean {
  return getStatus(state) === ConnectionStatus.DISCONNECTED;
}
export function isConnected (state: any): boolean {
  return getStatus(state) === ConnectionStatus.CONNECTED;
}
export function getStatus (state: any): string {
  return conn(state).get('status');
}
