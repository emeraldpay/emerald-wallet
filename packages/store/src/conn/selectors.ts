import { initialState } from './reducer';
import { ConnectionStatus, IConnState, moduleName } from './types';

function conn (state: any): IConnState {
  return state[moduleName] || initialState;
}
export function isOffline (state: any): boolean {
  return getStatus(state) === ConnectionStatus.DISCONNECTED;
}
export function isConnected (state: any): boolean {
  return getStatus(state) === ConnectionStatus.CONNECTED;
}
export function getStatus (state: any): string {
  return conn(state).status;
}
