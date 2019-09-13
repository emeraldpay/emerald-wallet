import { connect } from 'react-redux';
import { shell } from 'electron';
import { Landing } from '@emeraldwallet/ui';
import { screen } from '@emeraldwallet/store';

export default connect(
  null,
  (dispatch, ownProps) => ({
    onAboutClick() {
      const url = 'https://emeraldwallet.io/coins';
      shell.openExternal(url);
    },
    onGenerate() {
      dispatch(screen.actions.gotoScreen('landing-generate'));
    },
    onImportJson() {
      dispatch(screen.actions.gotoScreen('landing-importjson'));
    },
    onImportPrivateKey() {
      dispatch(screen.actions.gotoScreen('landing-import-private-key'));
    },
    onLedger() {
      dispatch(screen.actions.gotoScreen('landing-add-from-ledger', 'home'));
    },
  })
)(Landing);
