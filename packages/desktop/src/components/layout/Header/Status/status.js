import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import NetworkSelector from './networkSelector';
import launcher from '../../../../store/launcher';
import wallet from '../../../../store/wallet';

const Status = ({
  connecting, switchNetwork,
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
  showDetails: PropTypes.bool.isRequired,
  connecting: PropTypes.bool.isRequired,
  switchNetwork: PropTypes.func,
};

export default connect(
  (state, ownProps) => {
    return {
      chain: state.launcher.get('chain'),
      geth: state.launcher.get('geth'),
      connecting: state.launcher.get('connecting'),
    };
  },
  (dispatch, ownProps) => ({
    switchNetwork: (net) => {
      dispatch(launcher.actions.useRpc({ geth: net.geth, chain: net.chain }));
      dispatch(launcher.actions.saveSettings({ chain: net.chain, geth: net.geth }));
      dispatch(wallet.actions.switchEndpoint({ chainId: net.chain.id, chain: net.chain.name }));
    },
  })
)(Status);
