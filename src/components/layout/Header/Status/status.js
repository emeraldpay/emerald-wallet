import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LinearProgress from 'material-ui/LinearProgress';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Network as NetworkIcon, NetworkDisconnected as NetworkDisconnectedIcon } from 'emerald-js-ui/lib/icons3';
import { separateThousands } from '../../../../lib/convert';
import { waitForServicesRestart } from '../../../../store/store';
import NetworkSelector from './networkSelector';
import launcher from '../../../../store/launcher';
import wallet from '../../../../store/wallet';

const Status = ({ block, progress, peerCount, showDetails, connecting, switchNetwork, chain, geth, muiTheme }) => {
  const styles = {
    // details: {
    //   color: muiTheme.palette.alternateTextColor,
    //   lineHeight: '16px',
    // },
    block: {
      marginLeft: '10px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  let icon = null;

  if (connecting) {
    icon =
      <NetworkDisconnectedIcon style={{color: muiTheme.palette.secondaryTextColor}} />;
  } else {
    icon =
      <NetworkIcon style={{color: muiTheme.palette.secondaryTextColor}} />;
  }

  return (
    <div style={styles.block}>
      {icon}
      <NetworkSelector onNetworkChange={ switchNetwork }/>
    </div>
  );
};

Status.propTypes = {
  block: PropTypes.number.isRequired,
  progress: PropTypes.number,
  peerCount: PropTypes.number,
  showDetails: PropTypes.bool.isRequired,
  connecting: PropTypes.bool.isRequired,
  switchNetwork: PropTypes.func,
};

export default connect(
  (state, ownProps) => {
    const curBlock = state.network.getIn(['currentBlock', 'height'], -1);
    const showDetails = state.launcher.getIn(['geth', 'type']) === 'local';
    const props = {
      block: curBlock,
      showDetails,
      chain: state.launcher.get('chain'),
      geth: state.launcher.get('geth'),
      connecting: state.launcher.get('connecting'),
    };
    if (showDetails) {
      const tip = state.network.getIn(['sync', 'highestBlock'], -1);
      const peerCount = state.network.get('peerCount');
      const progress = (curBlock / tip) * 100;
      return {
        progress: isNaN(progress) || (!isFinite(progress)) ? 0 : progress,
        peerCount,
        ...props,
      };
    }
    return props;
  },
  (dispatch, ownProps) => ({
    switchNetwork: (net) => {
      dispatch(launcher.actions.useRpc({ geth: net.geth, chain: net.chain }));
      dispatch(launcher.actions.saveSettings({ chain: net.chain, geth: net.geth }));
      waitForServicesRestart();
      dispatch(wallet.actions.switchEndpoint({ chainId: net.chain.id, chain: net.chain.name }));
    },
  })
)(muiThemeable()(Status));
