import React from 'react';
import {AppBar, LinearProgress, Toolbar} from '@material-ui/core';
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
    openSettings, theme, network, showProgress, progress, tip, showFiat,
  } = props;

  const showProgressBar = (show) => {
    if (!show) {
      return null;
    }
    return (
      <div style={{padding: '0px 5px 5px 5px'}}>
        <LinearProgress
          disabled={showProgress}
          mode="determinate"
          color={theme.palette.primary.main}
          value={progress}
          style={{height: '2px'}}
        />
      </div>
    );
  };

  const blockDisplayStyles = {
    text: {
      textTransform: 'none',
      fontWeight: 'normal',
      fontSize: '16px',
    },
  };

  const BlockDisplay = ({classes}) => {
    const displayProgress = parseInt(100 - progress, 10);
    const label = showProgress ? `${separateThousands(tip - network.currentBlock.height)} blocks left (${displayProgress}%)` : separateThousands(network.currentBlock.height, ' ');
    return (
      <div style={{marginTop: showProgress ? '7px' : null}}>
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
        {showProgressBar(showProgress)}
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
