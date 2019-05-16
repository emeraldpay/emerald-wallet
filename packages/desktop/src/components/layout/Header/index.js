import { connect } from 'react-redux';
import Header from './header';
import screen from '../../../store/wallet/screen';
import Launcher from '../../../store/launcher';

export default (connect(
  (state, ownProps) => {
    const showFiat = Launcher.selectors.getChainName(state).toLowerCase() === 'mainnet';

    return {
      network: state.network.toJS(),
      showFiat,
    };
  },
  (dispatch, ownProps) => ({
    openSettings: () => {
      dispatch(screen.actions.gotoScreen('settings'));
    },
  })
)(Header));
