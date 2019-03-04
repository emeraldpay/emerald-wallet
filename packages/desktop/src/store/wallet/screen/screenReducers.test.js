import screenReducers from './screenReducers';

describe('screenReducers', () => {
  it('NOTIFICATION_SHOW stores message, type and duration', () => {
    // prepare
    let state = screenReducers(null, {});

    // do
    state = screenReducers(state, {
      type: 'SCREEN/NOTIFICATION_SHOW',
      message: 'Settings saved',
      notificationType: 'success',
      duration: 3000,
    });

    // assert
    expect(state.get('notificationMessage')).toEqual('Settings saved');
    expect(state.get('notificationType')).toEqual('success');
    expect(state.get('notificationDuration')).toEqual(3000);

    // do
    state = screenReducers(state, {
      type: 'SCREEN/NOTIFICATION_SHOW',
      message: 'Settings saved - 2',
      notificationType: 'warning',
      duration: 1000,
    });

    // assert
    expect(state.get('notificationMessage')).toEqual('Settings saved - 2');
    expect(state.get('notificationType')).toEqual('warning');
    expect(state.get('notificationDuration')).toEqual(1000);
  });

  it('NOTIFICATION_SHOW clears message, type and duration', () => {
    // prepare
    let state = screenReducers(null, {});

    state = screenReducers(state, {
      type: 'SCREEN/NOTIFICATION_SHOW',
      message: 'Settings saved',
      notificationType: 'success',
      duration: 3000,
    });
    expect(state.get('notificationMessage')).toEqual('Settings saved');
    expect(state.get('notificationType')).toEqual('success');
    expect(state.get('notificationDuration')).toEqual(3000);

    // do
    state = screenReducers(state, {
      type: 'SCREEN/NOTIFICATION_CLOSE',
    });

    // assert
    expect(state.get('notificationMessage')).toEqual(null);
    // expect(state.get('notificationType')).toEqual(null);
    expect(state.get('notificationDuration')).toEqual(null);
  });
});
