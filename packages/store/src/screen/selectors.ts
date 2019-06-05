export const getCurrentDialog = (state: any) => ({
  dialog: state.screen.get('dialog'),
  dialogItem: state.get('dialogItem'),
});

export const getCurrentScreen = (state: any) => ({
  screen: state.screen.get('screen'),
  screenItem: state.screen.get('item'),
});

export const getError = (state: any) => (state.screen.get('error'));
