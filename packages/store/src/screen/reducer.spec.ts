import { reducer } from './reducer';
import * as types from './types';

describe('screen reducer', () => {
  it('NOTIFICATION_SHOW stores message, type and duration', () => {
    let state = reducer(undefined, {
      duration: 3000,
      message: 'Settings saved',
      notificationType: 'success',
      type: 'SCREEN/NOTIFICATION_SHOW',
    } as types.IShowNotificationAction);

    expect(state.notificationMessage).toEqual('Settings saved');
    expect(state.notificationType).toEqual('success');
    expect(state.notificationDuration).toEqual(3000);

    state = reducer(state, {
      duration: 1000,
      message: 'Settings saved - 2',
      notificationType: 'warning',
      type: 'SCREEN/NOTIFICATION_SHOW',
    } as types.IShowNotificationAction);

    expect(state.notificationMessage).toEqual('Settings saved - 2');
    expect(state.notificationType).toEqual('warning');
    expect(state.notificationDuration).toEqual(1000);
  });

  it('NOTIFICATION_SHOW clears message, type and duration', () => {
    let state = reducer(undefined, {
      duration: 3000,
      message: 'Settings saved',
      notificationType: 'success',
      type: 'SCREEN/NOTIFICATION_SHOW',
    } as types.IShowNotificationAction);

    expect(state.notificationMessage).toEqual('Settings saved');
    expect(state.notificationType).toEqual('success');
    expect(state.notificationDuration).toEqual(3000);

    state = reducer(state, { type: 'SCREEN/NOTIFICATION_CLOSE' } as types.ICloseNotificationAction);

    expect(state.notificationMessage).toEqual(null);
    expect(state.notificationDuration).toEqual(null);
  });
});
