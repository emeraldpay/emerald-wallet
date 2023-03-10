import { INITIAL_STATE } from './reducer';
import { ConnectionStatus, moduleName } from './types';
import { IState } from '../types';

export function getStatus(state: IState): string {
  const { status } = state[moduleName] ?? INITIAL_STATE;

  return status;
}

export function isConnected(state: IState): boolean {
  return getStatus(state) === ConnectionStatus.CONNECTED;
}

export function isOffline(state: IState): boolean {
  return getStatus(state) === ConnectionStatus.DISCONNECTED;
}
