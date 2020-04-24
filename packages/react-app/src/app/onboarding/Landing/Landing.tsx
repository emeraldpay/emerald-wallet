import { screen } from '@emeraldwallet/store';
import { connect } from 'react-redux';
import Landing from './LandingView';

export default connect(
  null,
  (dispatch, ownProps) => ({
    onAboutClick () {
      const url = 'https://emeraldwallet.io/coins';
      dispatch(screen.actions.openLink(url));
    },
    onCreateWallet () {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_WALLET));
    },
    onImportJson () {
      dispatch(screen.actions.gotoScreen('landing-importjson'));
    },
    onImportPrivateKey () {
      dispatch(screen.actions.gotoScreen('landing-import-private-key'));
    },
    onImportMnemonic () {
      dispatch(screen.actions.gotoScreen('import-mnemonic', screen.Pages.HOME));
    },
    onLedger () {
      dispatch(screen.actions.gotoScreen('landing-add-from-ledger', screen.Pages.HOME));
    }
  })
)(Landing);
