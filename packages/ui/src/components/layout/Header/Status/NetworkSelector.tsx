import {
  Block as BlockIcon, Network as NetworkIcon, NetworkDisconnected as NetworkDisconnectedIcon
} from '@emeraldplatform/ui-icons';
import { blockchainByName, utils } from '@emeraldwallet/core';
import Grid from '@material-ui/core/Grid';
import Menu from '@material-ui/core/Menu';
import { CSSProperties, withStyles, withTheme } from '@material-ui/styles';
import * as React from 'react';
import Button from '../../../common/Button';

interface ItemProps {
  title: string;
  height?: any;
  textColor: any;
}

class ExtendedMenuItem extends React.Component<ItemProps> {
  public render () {
    const {
      textColor, title, height
    } = this.props;
    return (
      <Grid container={true} direction='column'
        style={{
          padding: '5px 80px 5px 40px',
          fontSize: '14px',
          borderLeft: '',
          marginLeft: '0px',
          lineHeight: '20px'
        }}>
        <Grid item={true} style={{ color: textColor }}>{blockchainByName(title).getTitle()}</Grid>
        <Grid item={true}>
          <Grid container={true} style={{ color: textColor }}>
            <BlockIcon /><div>{utils.separateThousands(height, ' ')}</div>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

const selectorStyles = {
  buttonText: {
    textTransform: 'none',
    fontSize: '16px',
    paddingRight: '10px'
  } as CSSProperties
};

interface Props {
  blockchains: any[];
  classes: any;
  theme: any;
}

interface State {
  anchorEl: any | null;
}

class NetworkSelectorRender extends React.Component<Props, State> {
  constructor (props) {
    super(props);
    this.state = {
      anchorEl: null
    };
  }

  public handleToggle = (event) => {
    this.setState({
      anchorEl: event.currentTarget
    });
  }

  public handleClose = () => {
    this.setState({
      anchorEl: null
    });
  }

  public render () {
    const {
      theme, classes
    } = this.props;
    const blockchains = this.props.blockchains || [];
    const icon = blockchains.length > 0 ? <NetworkIcon/> : <NetworkDisconnectedIcon/>;

    // const styles = getStyles(this.props);

    const { anchorEl } = this.state;

    return (
      <div>
        <Button
          variant='text'
          // aria-owns={anchorEl ? 'networks-menu' : undefined}
          // aria-haspopup="true"
          onClick={this.handleToggle}
          icon={icon}
          classes={{
            text: classes.buttonText
          }}
        />
        <Menu
          elevation={0}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          id='networks-menu'
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={this.handleClose}
        >
          {blockchains.map((net) => <ExtendedMenuItem
            key={net.id}
            title={net.title}
            height={net.height}
            textColor={theme.palette.text.secondary}
          />)}
        </Menu>
      </div>
    );
  }
}

export default withStyles(selectorStyles)(withTheme(NetworkSelectorRender));
