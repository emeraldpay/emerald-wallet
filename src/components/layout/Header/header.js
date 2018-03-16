import React from 'react';
import { AppBar, FlatButton, LinearProgress } from 'material-ui';
import { Block as BlockIcon, Settings as SettingsIcon } from 'emerald-js-ui/lib/icons2';
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
  const { openSettings, muiTheme, network, showProgress, progress, tip } = props;

  const showProgressBar = (show) => {
    if (!show) {
      return null;
    }
    return (
      <div style={{padding: '0px 5px 5px 5px'}}>
        <LinearProgress
          disabled={showProgress}
          mode="determinate"
          color="white"
          value={progress}
          style={{height: '2px'}}
        />
      </div>
    );
  };

  const BlockDisplay = () => {
    const displayProgress = parseInt(100 - progress, 10);
    const label = showProgress ? `${separateThousands(tip - network.currentBlock.height)} blocks left (${displayProgress}%)` : separateThousands(network.currentBlock.height, ' ');
    return (
      <div style={{marginTop: showProgress ? '7px' : null}}>
        <FlatButton
          disabled={true}
          label={label}
          style={{color: muiTheme.palette.alternateTextColor, lineHeight: 'inherit'}}
          labelStyle={styles.buttons.label}
          icon={<BlockIcon color={muiTheme.palette.alternateTextcolor}/>}
        />
        {showProgressBar(showProgress)}
      </div>
    );
  };

  const SettingsButton = () => (
    <FlatButton
      hoverColor="transparent"
      onTouchTap={ openSettings }
      style={{color: muiTheme.palette.alternateTextColor}}
      label="Settings"
      labelStyle={styles.buttons.label}
      icon={<SettingsIcon color={muiTheme.palette.alternateTextcolor}/>}
    />);

  return (
    <div>
      <AppBar
        title="Emerald Wallet"
        titleStyle={{fontSize: '16px'}}
        showMenuIconButton={false}
        iconStyleRight={styles.appBarRight}
        iconElementRight={
          <div style={styles.appBarRight}>
            <Total />
            <BlockDisplay />
            <Status />
            <SettingsButton />
          </div>
        }
      />
      <SyncWarning />
    </div>
  );
};

export default Header;
