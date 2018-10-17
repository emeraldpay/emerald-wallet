import { connect } from 'react-redux';
import Landing from '../../components/landing';
import screen from '../../store/wallet/screen';

export default connect(
  (state, ownProps) => ({
    connected: state.ledger.get('connected'),
  }),
  (dispatch, ownProps) => ({
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
