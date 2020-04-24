import { reducer } from './reducer';
import * as types from './types';

describe('screen reducer', () => {
  it('NOTIFICATION_SHOW stores message, type and duration', () => {
    // prepare

    // do
    let state: any = reducer(undefined, {
      type: 'SCREEN/NOTIFICATION_SHOW',
      message: 'Settings saved',
      notificationType: 'success',
      duration: 3000
    } as types.IShowNotificationAction);

    // assert
    expect(state.get('notificationMessage')).toEqual('Settings saved');
    expect(state.get('notificationType')).toEqual('success');
    expect(state.get('notificationDuration')).toEqual(3000);

    // do
    state = reducer(state, {
      type: 'SCREEN/NOTIFICATION_SHOW',
      message: 'Settings saved - 2',
      notificationType: 'warning',
      duration: 1000
    } as types.IShowNotificationAction);

    // assert
    expect(state.get('notificationMessage')).toEqual('Settings saved - 2');
    expect(state.get('notificationType')).toEqual('warning');
    expect(state.get('notificationDuration')).toEqual(1000);
  });

  it('NOTIFICATION_SHOW clears message, type and duration', () => {
    // prepare

    let state: any = reducer(undefined, {
      type: 'SCREEN/NOTIFICATION_SHOW',
      message: 'Settings saved',
      notificationType: 'success',
      duration: 3000
    } as types.IShowNotificationAction);
    expect(state.get('notificationMessage')).toEqual('Settings saved');
    expect(state.get('notificationType')).toEqual('success');
    expect(state.get('notificationDuration')).toEqual(3000);

    // do
    state = reducer(state, {
      type: 'SCREEN/NOTIFICATION_CLOSE'
    } as types.ICloseNotificationAction);

    // assert
    expect(state.get('notificationMessage')).toEqual(null);
    // expect(state.get('notificationType')).toEqual(null);
    expect(state.get('notificationDuration')).toEqual(null);
  });
});
