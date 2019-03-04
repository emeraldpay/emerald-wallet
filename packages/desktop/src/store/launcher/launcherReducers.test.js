import launcherReducers from './launcherReducers';

describe('launcherReducers', () => {
  it('on LAUNCHER/CONFIG should update state from config', () => {
    let state = launcherReducers(null, {});
    expect(state.get('terms')).toEqual('none');
    state = launcherReducers(state, {
      type: 'LAUNCHER/CONFIG',
      config: {
        terms: 'v1',
      },
    });
    expect(state.get('terms')).toEqual('v1');
  });

  it('on LAUNCHER/MESSAGE should update state', () => {
    let state = launcherReducers(null, {});
    expect(state.get('message').get('text')).toBeDefined();
    state = launcherReducers(state, {
      type: 'LAUNCHER/MESSAGE',
      msg: 'Hello',
      level: 666,
    });
    expect(state.get('message').get('text')).toEqual('Hello');
    expect(state.get('message').get('level')).toEqual(666);
  });
});
