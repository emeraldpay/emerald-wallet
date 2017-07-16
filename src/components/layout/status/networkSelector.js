import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Networks } from 'lib/networks';
import { useRpc, saveSettings } from 'store/launcherActions';
import { MenuItem, DropDownMenu } from 'material-ui';

const styles = {
    main: {
        fontSize: '14px',
        height: '57px', /* gagarin55: this is extremely important hack to align DropDownMenu vertically */
    },
    label: {
        color: '#747474',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
    },
};

class NetworkSelectorRender extends React.Component {

    render() {
        const { chain, rpcType, switchChain } = this.props;

        const networkClick = (net) => {
            if (net.id !== chain.get('id') || net.type !== chain.get('type')) {
                switchChain(net);
            }
        };

        const isCurrentNetwork = (net) => (net.name === chain.get('name') && net.type === rpcType);

        return (
            <DropDownMenu value={chain.get('id')}
                          style={styles.main}
                          underlineStyle={{ display: 'none' }}
                          labelStyle={styles.label}>
            {Networks.map((net) =>
                <MenuItem
                    value={net.id}
                    key={net.id}
                    primaryText={net.title}
                    checked={isCurrentNetwork(net)}
                    onClick={() => networkClick(net)}
                />
            )}
            </DropDownMenu>);
    }
}

NetworkSelectorRender.propTypes = {
    chain: PropTypes.object.isRequired,
    rpcType: PropTypes.string.isRequired,
    switchChain: PropTypes.func.isRequired,
};

const NetworkSelector = connect(
    (state, ownProps) => ({
        chain: state.network.get('chain') || {},
        rpcType: state.launcher.getIn(['chain', 'rpc']),
    }),
    (dispatch, ownProps) => ({
        switchChain: (network) => {
            dispatch(useRpc(network.type));
            dispatch(saveSettings({chain: network.name, chainId: network.chainId}));
        },
    })
)(NetworkSelectorRender);

export default NetworkSelector;
