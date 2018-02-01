import React from 'react';
import { connect } from 'react-redux';
import { AppBar, FlatButton, LinearProgress } from 'material-ui';
import { Logo as LogoIcon } from 'emerald-js-ui/lib/icons';
import { Block as BlockIcon, Settings as SettingsIcon } from 'emerald-js-ui/lib/icons2';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Status from './status/status';
import Total from './total';
import { separateThousands } from '../../../lib/convert';

const Header = (props) => {
  const { openSettings, muiTheme, network, backScreen, showProgress, progress, tip } = props;
  const openSettingsWithBackScreen = () => {
    openSettings(backScreen);
  };

  const showProgressBar = (show) => {
    if (!show) {
      return null;
    }
    return (
      <div style={{padding: '0px 5px 5px 5px'}}>
        <LinearProgress disabled={showProgress} mode="determinate" color="white" value={progress} style={{height: '2px'}}/>
      </div>
    );
  };

  const BlockDisplay = () => {
    const displayProgress = parseInt(100 - progress, 10);
    const label = showProgress ? `${separateThousands(tip - network.currentBlock.height)} blocks left (${displayProgress}%)` : separateThousands(network.currentBlock.height, ' ');
    return (
      <div style={{marginTop: showProgress ? '7px' : null}}>
        <FlatButton disabled={true} label={label} style={{color: muiTheme.palette.alternateTextColor}} labelStyle={{textTransform: 'none'}} icon={<BlockIcon color={muiTheme.palette.alternateTextcolor}/>}/>
        {showProgressBar(showProgress)}
      </div>
    );
  };

  return (
    <AppBar title="Emerald Wallet" titleStyle={{fontSize: '18px'}} iconElementLeft={<LogoIcon/>} iconElementRight={
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '50px'}}>
        <Total />
        <BlockDisplay />
        <Status />
        <FlatButton onTouchTap={ openSettingsWithBackScreen } style={{color: muiTheme.palette.alternateTextColor}} label="Settings" labelStyle={{marginLeft: '-3px'}} icon={<SettingsIcon color={muiTheme.palette.alternateTextcolor}/>} />
      </div>
    } />
  );
};

export default Header;
