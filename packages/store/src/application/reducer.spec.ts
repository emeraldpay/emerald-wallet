import { reducer as launcherReducers } from './reducer';
import { ActionTypes } from './types';

describe('launcherReducers', () => {
  it('on LAUNCHER/CONFIG should update state from config', () => {
    let state = launcherReducers(undefined, {
      type: ActionTypes.CONNECTING,
      payload: false,
    });

    expect(state.terms).toEqual('none');

    state = launcherReducers(state, {
      type: ActionTypes.CONFIG,
      payload: {
        terms: 'v1',
      },
    });

    expect(state.terms).toEqual('v1');
  });

  it('on LAUNCHER/MESSAGE should update state', () => {
    let state = launcherReducers(undefined, {
      type: ActionTypes.CONNECTING,
      payload: false,
    });

    expect(state.message.message).toBeDefined();

    state = launcherReducers(state, {
      type: ActionTypes.MESSAGE,
      level: 666,
      message: 'Hello',
    });

    expect(state.message.level).toEqual(666);
    expect(state.message.message).toEqual('Hello');
  });
});
