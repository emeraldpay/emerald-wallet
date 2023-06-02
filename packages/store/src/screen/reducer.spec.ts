import { reducer } from './reducer';
import * as types from './types';

describe('screen reducer', () => {
  it('NOTIFICATION_SHOW stores message, type and duration', () => {
    let state = reducer(undefined, {
      type: 'SCREEN/NOTIFICATION_SHOW',
      message: 'Settings saved',
      messageType: 'success',
      duration: 3000,
    } as types.IShowNotificationAction);

    expect(state.notificationMessage).toEqual('Settings saved');
    expect(state.notificationMessageType).toEqual('success');
    expect(state.notificationDuration).toEqual(3000);

    state = reducer(state, {
      type: 'SCREEN/NOTIFICATION_SHOW',
      message: 'Settings saved - 2',
      messageType: 'warning',
      duration: 1000,
    } as types.IShowNotificationAction);

    expect(state.notificationMessage).toEqual('Settings saved - 2');
    expect(state.notificationMessageType).toEqual('warning');
    expect(state.notificationDuration).toEqual(1000);
  });

  it('NOTIFICATION_SHOW clears message, type and duration', () => {
    let state = reducer(undefined, {
      type: 'SCREEN/NOTIFICATION_SHOW',
      message: 'Settings saved',
      messageType: 'success',
      duration: 3000,
    } as types.IShowNotificationAction);

    expect(state.notificationMessage).toEqual('Settings saved');
    expect(state.notificationMessageType).toEqual('success');
    expect(state.notificationDuration).toEqual(3000);

    state = reducer(state, { type: 'SCREEN/NOTIFICATION_CLOSE' } as types.ICloseNotificationAction);

    expect(state.notificationDuration).toEqual(null);
  });
});
