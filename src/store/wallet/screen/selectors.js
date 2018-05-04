export const getCurrentDialog = (state) => ({
  dialog: state.wallet.screen.get('dialog'),
  dialogItem: state.wallet.screen.get('dialogItem'),
});

export const getCurrentScreen = (state) => ({
  screen: state.wallet.screen.get('screen'),
  screenItem: state.wallet.screen.get('item'),
});
