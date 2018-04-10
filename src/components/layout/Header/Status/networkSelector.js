import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { MenuItem, DropDownMenu } from 'material-ui';
import { ArrowDown } from 'emerald-js-ui/lib/icons2';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Networks, findNetwork } from '../../../../lib/networks';


class ExtendedMenuItem extends React.Component {
  render() {
    const {muiTheme, checked, onClick, net} = this.props;
    const networkType = net.geth.type === 'local' ? 'Full Node' : 'Light Node';
    return (
      <div
        onClick={onClick}
        style={{
          cursor: 'pointer',
          padding: '5px 15px 5px 15px',
          borderLeft: checked ? `5px solid ${muiTheme.palette.primary1Color}` : '',
          marginLeft: checked ? '' : '5px',
        }}
      >
        <div>{net.title}</div>
        <div style={{ color: muiTheme.palette.disabledColor, fontSize: '12px', paddingTop: '3px' }}>{networkType}</div>
      </div>
    );
  }
}
ExtendedMenuItem.muiName = 'MenuItem';


class NetworkSelectorRender extends React.Component {
  render() {
    const { chain, geth, onNetworkChange, muiTheme } = this.props;
    const styles = {
      main: {
        marginRight: '-20px',
        paddingRight: '10px',
        color: muiTheme.palette.alternateTextColor,
        height: muiTheme.spacing.desktopToolbarHeight, /* gagarin55: this is extremely important hack to align DropDownMenu vertically */
      },
      label: {
        color: muiTheme.palette.secondaryTextColor,
        fontSize: '16px',
        paddingLeft: '5px',
        paddingRight: '30px',
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
        iconStyle={{display: 'none'}}
        labelStyle={ styles.label }>
        { Networks.map((net) =>
          <ExtendedMenuItem
            value={net.id}
            key={net.id}
            primaryText={net.title}
            checked={isCurrentNetwork(net)}
            onClick={() => networkClick(net)}
            net={net}
            muiTheme={muiTheme}
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
