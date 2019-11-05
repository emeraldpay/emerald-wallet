import { screen } from '@emeraldwallet/store';
import { Landing } from '@emeraldwallet/ui';
import { connect } from 'react-redux';

export default connect(
  null,
  (dispatch, ownProps) => ({
    onAboutClick () {
      const url = 'https://emeraldwallet.io/coins';
      dispatch(screen.actions.openLink(url));
    },
    onGenerate () {
      dispatch(screen.actions.gotoScreen('landing-generate'));
    },
    onImportJson () {
      dispatch(screen.actions.gotoScreen('landing-importjson'));
    },
    onImportPrivateKey () {
      dispatch(screen.actions.gotoScreen('landing-import-private-key'));
    },
    onImportMnemonic () {
      dispatch(screen.actions.gotoScreen('import-mnemonic', 'home'));
    },
    onLedger () {
      dispatch(screen.actions.gotoScreen('landing-add-from-ledger', 'home'));
    }
  })
)(Landing);
