import React from 'react';
import { AppBar, LinearProgress } from 'material-ui';
import { withStyles } from '@material-ui/core';
import { Button } from '@emeraldwallet/ui';
import { Block as BlockIcon, Settings as SettingsIcon } from '@emeraldplatform/ui-icons';
import SyncWarning from '../../../containers/SyncWarning';
import Status from './Status';
import Total from './Total';
import { separateThousands } from '../../../lib/convert';

const styles = {
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
};

const Header = (props) => {
  const {
    openSettings, muiTheme, network, showProgress, progress, tip, showFiat,
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
          color={muiTheme.palette.primary1Color}
          value={progress}
          style={{height: '2px'}}
        />
      </div>
    );
  };

  const EmeraldTitle = () => {
    return (
      <div>
        <span style={{color: muiTheme.palette.primary1Color}}>Emerald </span>
        <span style={{color: muiTheme.palette.secondaryTextColor}}>Wallet</span>
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
          icon={<BlockIcon />}
        />
        {showProgressBar(showProgress)}
      </div>
    );
  };

  const StyledBlockDisplay = withStyles(blockDisplayStyles)(BlockDisplay);

  const SettingsButton = ({classes}) => (
    <Button
      variant="text"
      onClick={ openSettings }
      label="Settings"
      classes={{
        text: classes.text,
      }}
      icon={<SettingsIcon />}
    />);

  const StyledSettingsButton = withStyles(blockDisplayStyles)(SettingsButton);

  return (
    <div>
      <AppBar
        title={<EmeraldTitle />}
        style={{backgroundColor: muiTheme.palette.alternateTextColor, borderBottom: `1px solid ${muiTheme.palette.borderColor}`}}
        titleStyle={{fontSize: '16px'}}
        showMenuIconButton={false}
        iconStyleRight={styles.appBarRight}
        zDepth={0}
        iconElementRight={
          <div style={styles.appBarRight}>
            <Total showFiat={showFiat} />
            <StyledBlockDisplay />
            <Status />
            <StyledSettingsButton />
          </div>
        }
      />
      <SyncWarning />
    </div>
  );
};

export default Header;
