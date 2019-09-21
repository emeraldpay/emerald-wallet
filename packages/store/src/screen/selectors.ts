export const getCurrentDialog = (state: any) => ({
  dialog: state.screen.get('dialog'),
  dialogItem: state.screen.get('dialogItem')
});

export const getCurrentScreen = (state: any) => ({
  screen: state.screen.get('screen'),
  screenItem: state.screen.get('item')
});

export const getError = (state: any) => (state.screen.get('error'));

export const getNotification = (state: any) => ({
  notificationMessage: state.screen.get('notificationMessage'),
  notificationDuration: state.screen.get('notificationDuration'),
  notificationType: state.screen.get('notificationType'),
  notificationActionText: state.screen.get('notificationActionText'),
  notificationActionToDispatchOnActionClick: state.screen.get('notificationActionToDispatchOnActionClick')
});
