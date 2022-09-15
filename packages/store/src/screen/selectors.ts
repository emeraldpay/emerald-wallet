import { IState } from '../types';
import { ScreenState } from './types';

export function getCurrentDialog(state: IState): ScreenState {
  return { dialog: state.screen.dialog };
}

export function getCurrentScreen(state: IState): ScreenState {
  return {
    screen: state.screen.screen,
    screenItem: state.screen.screenItem,
    restoreData: state.screen.restoreData,
  };
}

export function getError(state: IState): Error | null | undefined {
  return state.screen.error;
}

export function getNotification(state: IState): ScreenState {
  return {
    notificationMessage: state.screen.notificationMessage,
    notificationDuration: state.screen.notificationDuration,
    notificationType: state.screen.notificationType,
    notificationActionText: state.screen.notificationActionText,
    notificationActionToDispatchOnActionClick: state.screen.notificationActionToDispatchOnActionClick,
  };
}
