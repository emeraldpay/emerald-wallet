import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LinearProgress from 'material-ui/LinearProgress';
import { separateThousands } from 'lib/convert';
import NetworkSelector from './networkSelector';
import { useRpc, saveSettings } from '../../../../store/launcherActions';
import history from '../../../../store/wallet/history';

const Render = ({ block, progress, peerCount, showDetails, connecting, switchNetwork }) => {
    const styles = {
        details: {
            color: '#47B04B',
            fontSize: '14px',
            lineHeight: '16px',
        },
        block: {
            height: '100%',
            display: 'flex',
            alignItems: 'center',
        },
    };

    let details = null;
    if (connecting) {
        details =
            <div style={styles.details}>
                <i className="fa fa-spin fa-spinner"/> Connecting...
            </div>;
    } else if (showDetails) {
        details =
            <div style={styles.details}>
                {peerCount} {peerCount === 1 ? 'peer' : 'peers'}, { separateThousands(block, ' ') } blocks
            </div>;
    } else {
        details =
            <div style={styles.details}>
                { separateThousands(block, ' ') } blocks
            </div>;
    }

    return (
        <div>
            <div style={styles.block}>
                {details}
                <NetworkSelector onNetworkChange={ switchNetwork }/>
            </div>
            {showDetails && <div><LinearProgress mode="determinate" color="green" value={progress} /></div>}
        </div>
    );
};

Render.propTypes = {
    block: PropTypes.number.isRequired,
    progress: PropTypes.number,
    peerCount: PropTypes.number,
    showDetails: PropTypes.bool.isRequired,
    connecting: PropTypes.bool.isRequired,
    switchNetwork: PropTypes.func,
};

const Status = connect(
    (state, ownProps) => {
        const curBlock = state.network.getIn(['currentBlock', 'height'], -1);
        const showDetails = state.launcher.getIn(['geth', 'type']) === 'local';
        const props = {
            block: curBlock,
            showDetails,
            connecting: state.launcher.get('connecting'),
        };
        if (showDetails) {
            const tip = state.network.getIn(['sync', 'highestBlock'], -1);
            const peerCount = state.network.get('peerCount');
            const progress = (curBlock / tip) * 100;
            return {
                progress: isNaN(progress) ? 100 : progress,
                peerCount,
                ...props,
            };
        }
        return props;
    },
    (dispatch, ownProps) => ({
        switchNetwork: (net) => {
            dispatch(useRpc({ geth: net.geth, chain: net.chain }));
            dispatch(saveSettings({ chain: net.chain, geth: net.geth }));
            dispatch(history.actions.init(net.chain.id));
        },
    })
)(Render);

export default Status;
