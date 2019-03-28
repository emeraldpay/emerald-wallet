import { connect } from 'react-redux';
import { shell } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import { Landing } from '@emeraldwallet/ui';
import screen from '../../store/wallet/screen';

export default connect(
  (state, ownProps) => ({
    connected: state.ledger.get('connected'),
  }),
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
      dispatch(screen.actions.gotoScreen('landing-add-from-ledger', 'landing'));
    },
  })
)(Landing);
