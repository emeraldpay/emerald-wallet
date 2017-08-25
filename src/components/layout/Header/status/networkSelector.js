import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useRpc, saveSettings } from 'store/launcherActions';
import { MenuItem, DropDownMenu } from 'material-ui';
import { Networks, findNetwork } from 'lib/networks';


const styles = {
    main: {
        fontSize: '14px',
        height: '58px', /* gagarin55: this is extremely important hack to align DropDownMenu vertically */
    },
    label: {
        color: '#747474',
        fontSize: '14px',
    },
};

class NetworkSelectorRender extends React.Component {

    render() {
        const { chain, geth, switchNetwork } = this.props;
        const isCurrentNetwork = (net) => (net.chain.id === chain.get('id')
            && (net.geth.url === geth.get('url')));
        const currentNetwork = findNetwork(geth.get('url'), chain.get('id')) || {};

        const networkClick = (net) => {
            if (!isCurrentNetwork(net)) {
                switchNetwork(net);
            }
        };

        return (
            <DropDownMenu
                value={ currentNetwork.id }
                style={ styles.main }
                underlineStyle={{ display: 'none' }}
                labelStyle={ styles.label }>
                { Networks.map((net) =>
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
    switchNetwork: PropTypes.func.isRequired,
    geth: PropTypes.object,
    chain: PropTypes.object,
};

const NetworkSelector = connect(
    (state, ownProps) => ({
        chain: state.launcher.get('chain'),
        geth: state.launcher.get('geth'),
    }),
    (dispatch, ownProps) => ({
        switchNetwork: (net) => {
            dispatch(useRpc({ geth: net.geth, chain: net.chain }));
            dispatch(saveSettings({ chain: net.chain, geth: net.geth }));
        },
    })
)(NetworkSelectorRender);

export default NetworkSelector;
