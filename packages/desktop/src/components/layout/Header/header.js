import React from 'react';
import {AppBar, Toolbar} from '@material-ui/core';
import {withStyles} from '@material-ui/styles';
import {Button} from '@emeraldwallet/ui';
import {Block as BlockIcon, Settings as SettingsIcon} from '@emeraldplatform/ui-icons';
import SyncWarning from '../../../containers/SyncWarning';
import Status from './Status';
import Total from './Total';
import {separateThousands} from '../../../lib/convert';
import EmeraldTitle from './Title';

const styles = (theme) => ({
  appBarRight: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 'inherit',
  },
  buttons: {
    label: {
      textTransform: 'none',
      fontWeight: 'normal',
      fontSize: '16px',
    },
  },
  appBarRoot: {
    backgroundColor: theme.palette.primary.contrastText,
  },
});

const Header = (props) => {
  const {
    openSettings, theme, network, showFiat,
  } = props;

  const blockDisplayStyles = {
    text: {
      textTransform: 'none',
      fontWeight: 'normal',
      fontSize: '16px',
    },
  };

  const BlockDisplay = ({classes}) => {
    const label = separateThousands(network.currentBlock.height, ' ');
    return (
      <div style={{marginTop: '7px'}}>
        <Button
          variant="text"
          color="secondary"
          disabled={true}
          label={label}
          classes={{
            text: classes.text,
          }}
          icon={<BlockIcon/>}
        />
      </div>
    );
  };

  const StyledBlockDisplay = withStyles(blockDisplayStyles)(BlockDisplay);

  const SettingsButton = ({classes}) => (
    <Button
      variant="text"
      onClick={openSettings}
      label="Settings"
      classes={{
        text: classes.text,
      }}
      icon={<SettingsIcon/>}
    />);

  const StyledSettingsButton = withStyles(blockDisplayStyles)(SettingsButton);

  return (
    <div>
      <div className={props.classes.appBarRoot}>
        <AppBar position="static" color="inherit">
          <Toolbar>
            <EmeraldTitle />
            <div className={props.classes.appBarRight}>
              <Total showFiat={showFiat}/>
              <StyledBlockDisplay/>
              <Status/>
              <StyledSettingsButton/>
            </div>
          </Toolbar>
        </AppBar>
      </div>
      <SyncWarning/>
    </div>
  );
};

export default withStyles(styles)(Header);
