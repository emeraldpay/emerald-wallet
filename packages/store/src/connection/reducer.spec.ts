import { setConnectionStatus } from './actions';
import { reducer } from './reducer';
import { isConnected, isOffline } from './selectors';
import { ConnectionState, ConnectionStatus, moduleName } from './types';
import { IState } from '../types';

const asGlobalState = (state: ConnectionState): IState => ({ [moduleName]: state } as IState);

describe('connection reducer', () => {
  it('should change connection status', () => {
    let state = reducer(undefined, setConnectionStatus(ConnectionStatus.CONNECTED));

    expect(isConnected(asGlobalState(state))).toBeTruthy();
    expect(isOffline(asGlobalState(state))).toBeFalsy();

    state = reducer(state, setConnectionStatus(ConnectionStatus.DISCONNECTED));

    expect(isConnected(asGlobalState(state))).toBeFalsy();
    expect(isOffline(asGlobalState(state))).toBeTruthy();
  });
});
