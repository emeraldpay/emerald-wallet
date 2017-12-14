import React from 'react';
import { connect } from 'react-redux';
import { IconButton } from 'material-ui';
import { Gear as SettingsIcon } from 'emerald-js-ui/lib/icons';
import { LogoIcon } from 'elements/Icons';
import Status from './status/status';
import Total from './total';
import screen from '../../../store/wallet/screen';

import classes from './header.scss';

export const Header = ({ maxWidth = '1220px', openSettings }) => {
  return (
    <div style={{backgroundColor: 'white'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', margin: '0 auto', maxWidth}}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <div className={ classes.title }>EMERALD WALLET</div>
          <div><LogoIcon height="33px" width="17px" /></div>
          <Total/>
        </div>
        <div style={{display: 'flex'}}>
          <Status />
          <IconButton onTouchTap={ openSettings }>
            <SettingsIcon className={ classes.settingsIcon }/>
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default connect(
  (state, ownProps) => ({}),
  (dispatch, ownProps) => ({
    openSettings: () => {
      dispatch(screen.actions.gotoScreen('settings'));
    },
  })
)(Header);

