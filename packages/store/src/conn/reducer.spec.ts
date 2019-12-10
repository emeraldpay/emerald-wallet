import { setConnStatus } from './actions';
import { reducer } from './reducer';
import { isConnected, isOffline } from './selectors';
import { ConnectionStatus, moduleName } from './types';

const asGlobal = (state: any) => ({ [moduleName]: state });

describe('conn reducer', () => {
  it('should change connection status', () => {
    let state = reducer(undefined, setConnStatus(ConnectionStatus.CONNECTED));
    expect(isConnected(asGlobal(state))).toBeTruthy();
    expect(isOffline(asGlobal(state))).toBeFalsy();

    state = reducer(state, setConnStatus(ConnectionStatus.DISCONNECTED));
    expect(isConnected(asGlobal(state))).toBeFalsy();
    expect(isOffline(asGlobal(state))).toBeTruthy();
  });
});
