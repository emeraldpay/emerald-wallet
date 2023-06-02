import { IState } from '../types';
import { ScreenState } from './types';

export function getCurrentDialog(state: IState): Pick<ScreenState, 'dialog' | 'dialogOptions'> {
  return { dialog: state.screen.dialog, dialogOptions: state.screen.dialogOptions };
}

export function getCurrentScreen(state: IState): Pick<ScreenState, 'screen' | 'screenItem' | 'restoreData'> {
  return {
    screen: state.screen.screen,
    screenItem: state.screen.screenItem,
    restoreData: state.screen.restoreData,
  };
}

export function getError(state: IState): Error | null | undefined {
  return state.screen.error;
}

export function getNotification(
  state: IState,
): Pick<
  ScreenState,
  | 'notificationMessage'
  | 'notificationMessageType'
  | 'notificationDuration'
  | 'notificationButtonText'
  | 'notificationOnButtonClick'
> {
  const {
    notificationMessage,
    notificationMessageType,
    notificationDuration,
    notificationButtonText,
    notificationOnButtonClick,
  } = state.screen;

  return {
    notificationMessage,
    notificationMessageType,
    notificationDuration,
    notificationButtonText,
    notificationOnButtonClick,
  };
}
