import React from 'react';
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
      const url = 'https://emeraldwallet.io';
      shell.openExternal(url);
    };
    return (
      <About
        onButtonClick={onButtonClick}
        onHelpClick={helpClick}
        onLicenseClick={licenseClick}
      />
    );
  }
}

export default AboutClass;
