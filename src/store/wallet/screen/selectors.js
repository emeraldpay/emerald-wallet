export const getCurrentDialog = (state) => ({
  dialog: state.wallet.screen.get('dialog'),
  dialogItem: state.wallet.screen.get('dialogItem'),
});
