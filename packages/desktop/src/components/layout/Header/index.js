import { connect } from 'react-redux';
import Header from './header';
import screen from '../../../store/wallet/screen';
import Launcher from '../../../store/launcher';

export default (connect(
  (state, ownProps) => {
    const showProgress = state.launcher.getIn(['geth', 'type']) === 'local' && state.network.getIn(['sync', 'syncing']);
    const curBlock = state.network.getIn(['currentBlock', 'height'], -1);
    const tip = state.network.getIn(['sync', 'highestBlock'], -1);
    const progress = (curBlock / tip) * 100;
    const invalidNumber = Number.isNaN(progress) || (!Number.isFinite(progress));
    const showFiat = Launcher.selectors.getChainName(state).toLowerCase() === 'mainnet';

    return {
      network: state.network.toJS(),
      showProgress: showProgress && !invalidNumber,
      progress: invalidNumber ? 0 : progress,
      tip,
      showFiat,
    };
  },
  (dispatch, ownProps) => ({
    openSettings: () => {
      dispatch(screen.actions.gotoScreen('settings'));
    },
  })
)(Header));
