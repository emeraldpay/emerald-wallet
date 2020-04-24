import { reducer as launcherReducers } from './reducer';

describe('launcherReducers', () => {
  it('on LAUNCHER/CONFIG should update state from config', () => {
    let state = launcherReducers(null, {});
    expect(state.terms).toEqual('none');
    state = launcherReducers(state, {
      type: 'LAUNCHER/CONFIG',
      payload: {
        terms: 'v1'
      }
    });
    expect(state.terms).toEqual('v1');
  });

  it('on LAUNCHER/MESSAGE should update state', () => {
    let state = launcherReducers(null, {});
    expect(state.message.text).toBeDefined();
    state = launcherReducers(state, {
      type: 'LAUNCHER/MESSAGE',
      msg: 'Hello',
      level: 666
    });
    expect(state.message.text).toEqual('Hello');
    expect(state.message.level).toEqual(666);
  });
});
