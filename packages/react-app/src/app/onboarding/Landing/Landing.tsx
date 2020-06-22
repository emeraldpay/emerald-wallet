import {screen} from '@emeraldwallet/store';
import {connect} from 'react-redux';
import Landing from './LandingView';

export default connect(
  null,
  (dispatch, ownProps) => ({
    onAboutClick () {
      const url = 'https://go.emrld.io/supported-coins';
      dispatch(screen.actions.openLink(url));
    },
    onCreateWallet () {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_WALLET));
    }
  })
)(Landing);
