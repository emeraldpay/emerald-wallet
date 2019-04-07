import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import NetworkSelector from './networkSelector';
import launcher from '../../../../store/launcher';
import wallet from '../../../../store/wallet';

const Status = ({
  block, progress, peerCount, showDetails, connecting, switchNetwork,
}) => {
  const styles = {
    block: {
      marginLeft: '10px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  return (
    <div style={styles.block}>
      <NetworkSelector connecting={connecting} onNetworkChange={ switchNetwork }/>
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
        progress: isNaN(progress) || (!isFinite(progress)) ? 0 : progress, // eslint-disable-line
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
      dispatch(wallet.actions.switchEndpoint({ chainId: net.chain.id, chain: net.chain.name }));
    },
  })
)(Status);
