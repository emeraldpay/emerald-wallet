import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from '@emeraldwallet/ui';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';
import { withStyles } from '@material-ui/core';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Network as NetworkIcon, NetworkDisconnected as NetworkDisconnectedIcon } from '@emeraldplatform/ui-icons';
import { Networks, findNetwork } from '../../../../lib/networks';

class ExtendedMenuItem extends React.Component {
  render() {
    const {
      muiTheme, checked, onClick, net,
    } = this.props;
    const networkType = net.geth.type === 'local' ? 'Full Node' : 'Remote Node';
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
        <div style={{ color: textColor }}>{net.title}</div>
        <div style={{ color: textColor, paddingTop: '3px' }}>{networkType}</div>
      </div>
    );
  }
}
ExtendedMenuItem.muiName = 'MenuItem';


// function getStyles(props) {
//   const { muiTheme } = props;
//   return {
//     main: {
//       marginRight: '-20px',
//       paddingRight: '10px',
//       height: muiTheme.spacing.desktopToolbarHeight, /* gagarin55: this is extremely important hack to align DropDownMenu vertically */
//     },
//     label: {
//       color: muiTheme.palette.secondaryTextColor,
//       fontSize: '16px',
//       paddingRight: '10px',
//     },
//   };
// }

const selectorStyles = {
  buttonText: {
    textTransform: 'none',
    fontSize: '16px',
    paddingRight: '10px',
  },
};

class NetworkSelectorRender extends React.Component {
  state = {
    open: false,
  };

  handleToggle = () => {
    this.setState((state) => ({ open: !state.open }));
  };

  handleClose = (event) => {
    if (this.anchorEl.contains(event.target)) {
      return;
    }
    this.setState({ open: false });
  };

  render() {
    const {
      chain, geth, onNetworkChange, connecting, muiTheme, classes,
    } = this.props;
    const icon = connecting ? <NetworkDisconnectedIcon /> : <NetworkIcon />;

    // const styles = getStyles(this.props);

    const isCurrentNetwork = (net) => (net.chain.id === chain.get('id')
      && (net.geth.url === geth.get('url')));
    const currentNetwork = findNetwork(geth.get('url'), chain.get('id')) || {};

    // Returns function which handles selection
    const createSelectionHandler = (net) => (event) => {
      if (this.anchorEl.contains(event.target)) {
        return;
      }
      this.setState({ open: false });
      if (!isCurrentNetwork(net)) {
        onNetworkChange(net);
      }
    };

    // return (
    //   <DropDownMenu
    //     value={ currentNetwork.id }
    //     style={ styles.main }
    //     underlineStyle={{ display: 'none' }}
    //     menuStyle={{
    //       border: `1px solid ${muiTheme.palette.borderColor}`,
    //       backgroundColor: muiTheme.palette.alternateTextColor,
    //       color: muiTheme.palette.secondaryTextColor,
    //       paddingTop: '12px',
    //       paddingBottom: '12px',
    //       maxWidth: '280px',
    //       boxShadow: `${muiTheme.palette.secondaryTextColor} 0px 0px 50px 0px`,
    //     }}
    //     iconStyle={{
    //       left: '-40px', marginLeft: '20px', stroke: muiTheme.palette.secondaryTextColor, color: muiTheme.palette.secondaryTextColor,
    //     }}
    //     iconButton={icon}
    //     labelStyle={ styles.label }>
    // { Networks.map((net) => <ExtendedMenuItem
    //   value={net.id}
    //   key={net.id}
    //   primaryText={net.title}
    //   checked={isCurrentNetwork(net)}
    //   onClick={() => networkClick(net)}
    //   net={net}
    //   muiTheme={muiTheme}
    // />)}
    //   </DropDownMenu>);

    const { open } = this.state;

    return (
      <div>
        <Button
          variant="text"
          color="secondary"
          buttonRef={(node) => { this.anchorEl = node; }}
          aria-owns={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={this.handleToggle}
          icon={icon}
          label={currentNetwork.title}
          classes={{
            text: classes.buttonText,
          }}
        />
        <Popper open={open} anchorEl={this.anchorEl} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              id="menu-list-grow"
              style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
            >
              <Paper>
                <ClickAwayListener onClickAway={this.handleClose}>
                  <MenuList>
                    {Networks.map((net) => <ExtendedMenuItem
                      value={net.id}
                      key={net.id}
                      primaryText={net.title}
                      checked={isCurrentNetwork(net)}
                      onClick={createSelectionHandler(net)}
                      net={net}
                      muiTheme={muiTheme}
                    />)}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    );
  }
}

const StyledNetSelector = withStyles(selectorStyles)(NetworkSelectorRender);

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
)(muiThemeable()(StyledNetSelector));

export default NetworkSelector;
