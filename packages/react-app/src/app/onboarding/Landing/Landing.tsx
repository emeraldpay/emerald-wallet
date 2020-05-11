import { addAccount, screen } from '@emeraldwallet/store';
import { AddType } from '@emeraldwallet/store/lib/add-account';
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
      dispatch(addAccount.actions.start());
      dispatch(addAccount.actions.setType(AddType.IMPORT_JSON));
      dispatch(screen.actions.gotoScreen(screen.Pages.ADD_ACCOUNT));
    },
    onImportPrivateKey () {
      dispatch(addAccount.actions.start());
      dispatch(addAccount.actions.setType(AddType.IMPORT_PRIVATE_KEY));
      dispatch(screen.actions.gotoScreen(screen.Pages.ADD_ACCOUNT));
    },
    onImportMnemonic () {
      dispatch(screen.actions.gotoScreen(screen.Pages.IMPORT_SEED_WALLET));
    },
    onLedger () {
      dispatch(screen.actions.gotoScreen('landing-add-from-ledger', screen.Pages.HOME));
    }
  })
)(Landing);
