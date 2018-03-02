import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { MenuItem, DropDownMenu } from 'material-ui';
import { ArrowDown } from 'emerald-js-ui/lib/icons2';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Networks, findNetwork } from '../../../../lib/networks';


class NetworkSelectorRender extends React.Component {
  render() {
    const { chain, geth, onNetworkChange, muiTheme } = this.props;
    const styles = {
      main: {
        marginRight: '-20px',
        color: muiTheme.palette.alternateTextColor,
        height: muiTheme.spacing.desktopToolbarHeight, /* gagarin55: this is extremely important hack to align DropDownMenu vertically */
      },
      label: {
        color: muiTheme.palette.alternateTextColor,
        fontSize: '16px',
        paddingLeft: '5px',
      },
    };
    const isCurrentNetwork = (net) => (net.chain.id === chain.get('id')
            && (net.geth.url === geth.get('url')));
    const currentNetwork = findNetwork(geth.get('url'), chain.get('id')) || {};

    const networkClick = (net) => {
      if (!isCurrentNetwork(net)) {
        onNetworkChange(net);
      }
    };

    return (
      <DropDownMenu
        value={ currentNetwork.id }
        style={ styles.main }
        underlineStyle={{ display: 'none' }}
        iconButton={<ArrowDown color={muiTheme.palette.alternateTextColor}/>}
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
  onNetworkChange: PropTypes.func,
  geth: PropTypes.object,
  chain: PropTypes.object,
};

const NetworkSelector = connect(
  (state, ownProps) => ({
    chain: state.launcher.get('chain'),
    geth: state.launcher.get('geth'),
  }),
  (dispatch, ownProps) => ({})
)(muiThemeable()(NetworkSelectorRender));

export default NetworkSelector;
