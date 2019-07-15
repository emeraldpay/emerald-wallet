import { connect } from 'react-redux';
import { screen } from '@emeraldwallet/store';
import Header from './header';

export default (connect(
  (state, ownProps) => {
    const showFiat = true;

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
