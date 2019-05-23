import React from 'react';
import {connect} from 'react-redux';
import {Button} from '@emeraldwallet/ui';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {withStyles, withTheme} from '@material-ui/styles';
import {Network as NetworkIcon, NetworkDisconnected as NetworkDisconnectedIcon} from '@emeraldplatform/ui-icons';
import {Networks, findNetwork} from '../../../../lib/networks';

class ExtendedMenuItem extends React.Component {
  render() {
    const {
      theme, checked, onClick, net,
    } = this.props;
    const textColor = checked ? theme.palette.primary.main : theme.palette.text.secondary;
    return (
      <div
        onClick={onClick}
        style={{
          cursor: 'pointer',
          padding: '5px 80px 5px 40px',
          fontSize: '14px',
          borderLeft: checked ? `5px solid ${theme.palette.primary.main}` : '',
          marginLeft: checked ? '' : '5px',
          lineHeight: '20px',
        }}>
        <div style={{color: textColor}}>{net.title}</div>
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
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };
  }

  handleToggle = (event) => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  handleClose = () => {
    this.setState({
      anchorEl: null,
    });
  };

  render() {
    const {
      chain, geth, onNetworkChange, connecting, theme, classes,
    } = this.props;
    const icon = connecting ? <NetworkDisconnectedIcon/> : <NetworkIcon/>;

    // const styles = getStyles(this.props);

    const isCurrentNetwork = (net) => (net.chain.id === chain.get('id')
      && (net.geth.url === geth.get('url')));
    const currentNetwork = findNetwork(geth.get('url'), chain.get('id')) || {};

    // Returns function which handles selection
    const createSelectionHandler = (net) => (event) => {
      this.setState({
        anchorEl: null,
      });

      if (!isCurrentNetwork(net)) {
        onNetworkChange(net);
      }
    };

    const {anchorEl} = this.state;

    return (
      <div>
        <Button
          variant="text"
          color="secondary"
          aria-owns={anchorEl ? 'networks-menu' : undefined}
          aria-haspopup="true"
          onClick={this.handleToggle}
          icon={icon}
          label={currentNetwork.title}
          classes={{
            text: classes.buttonText,
          }}
        />
        <Menu
          elevation={0}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          id="networks-menu"
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={this.handleClose}
        >
          {Networks.map((net) => <ExtendedMenuItem
            value={net.id}
            key={net.id}
            primaryText={net.title}
            checked={isCurrentNetwork(net)}
            onClick={createSelectionHandler(net)}
            net={net}
            theme={theme}
          />)}
        </Menu>
      </div>
    );
  }
}

const StyledNetSelector = withStyles(selectorStyles)(withTheme(NetworkSelectorRender));

const NetworkSelector = connect(
  (state, ownProps) => ({
    chain: state.launcher.get('chain'),
    geth: state.launcher.get('geth'),
  }),
  (dispatch, ownProps) => ({})
)(StyledNetSelector);

export default NetworkSelector;
