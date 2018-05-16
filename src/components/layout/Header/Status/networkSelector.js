import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DropDownMenu } from 'material-ui';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Network as NetworkIcon, NetworkDisconnected as NetworkDisconnectedIcon } from 'emerald-js-ui/lib/icons3';
import { Networks, findNetwork } from '../../../../lib/networks';


class ExtendedMenuItem extends React.Component {
  render() {
    const {muiTheme, checked, onClick, net} = this.props;
    const networkType = net.geth.type === 'local' ? 'Full Node' : 'Light Node';
    const textColor = checked ? muiTheme.palette.primary1Color : muiTheme.palette.secondaryTextColor;
    return (
      <div
        onClick={onClick}
        style={{
          cursor: 'pointer',
          padding: '5px 80px 5px 40px',
          fontSize: '14px',
          borderLeft: checked ? `5px solid ${muiTheme.palette.primary1Color}` : '',
          marginLeft: checked ? '' : '5px',
          lineHeight: '20px',
        }}
      >
        <div style={{ color: textColor}}>{net.title}</div>
        <div style={{ color: textColor, paddingTop: '3px' }}>{networkType}</div>
      </div>
    );
  }
}
ExtendedMenuItem.muiName = 'MenuItem';


function getStyles(props) {
  const { muiTheme } = props;
  return {
    main: {
      marginRight: '-20px',
      paddingRight: '10px',
      height: muiTheme.spacing.desktopToolbarHeight, /* gagarin55: this is extremely important hack to align DropDownMenu vertically */
    },
    label: {
      color: muiTheme.palette.secondaryTextColor,
      fontSize: '16px',
      paddingRight: '10px',
    },
  };
}

class NetworkSelectorRender extends React.Component {
  render() {
    const { chain, geth, onNetworkChange, connecting, muiTheme } = this.props;
    let icon;
    if (connecting) { // shanejonas: the wrapping span's here are to get around some coloring issues with material-ui's dropdown + iconbutton
      icon =
        <span>
          <NetworkDisconnectedIcon style={{color: muiTheme.palette.secondaryTextColor}}/>
        </span>;
    } else {
      icon =
        <span>
          <NetworkIcon style={{color: muiTheme.palette.secondaryTextColor}}/>
        </span>;
    }

    const styles = getStyles(this.props);

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
        menuStyle={{
          border: `1px solid ${muiTheme.palette.borderColor}`,
          backgroundColor: muiTheme.palette.alternateTextColor,
          color: muiTheme.palette.secondaryTextColor,
          paddingTop: '12px',
          paddingBottom: '12px',
          maxWidth: '280px',
          boxShadow: `${muiTheme.palette.secondaryTextColor} 0px 0px 50px 0px`,
        }}
        iconStyle={{left: '-40px', marginLeft: '20px', stroke: muiTheme.palette.secondaryTextColor, color: muiTheme.palette.secondaryTextColor}}
        iconButton={icon}
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
