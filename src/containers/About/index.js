import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Logo as EtcLogo } from 'emerald-js-ui/lib/icons';
import { Button } from 'emerald-js-ui';
import { shell } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import About from './About';

class AboutClass extends React.Component {
  render() {
    const helpClick = () => {
      const url = 'https://github.com/ETCDEVTeam/emerald-wallet/';
      shell.openExternal(url);
    };
    const licenseClick = () => {
      const url = 'https://github.com/ETCDEVTeam/emerald-wallet/blob/master/LICENSE';
      shell.openExternal(url);
    };
    const onButtonClick = () => {
      const url = 'https://www.etcdevteam.com/support.html';
      shell.openExternal(url);
    };
    return (
      <About onButtonClick={onButtonClick} onHelpClick={helpClick} onLicenseClick={licenseClick} />
    );
  }
}

export default AboutClass;
