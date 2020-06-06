import React from 'react';
import {ipcRenderer, shell} from 'electron';
import { ThemeProvider } from '@material-ui/core/styles';
import {About, Theme} from '@emeraldwallet/ui';

class AboutContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    ipcRenderer.invoke('get-version').then((result) => {
      console.log(JSON.stringify(result));
        this.setState({
          os: result.os,
          version: result.version,
          gitVersion: result.gitVersion,
        });
    })
  }

  helpClick = () => {
    const url = 'https://go.emrld.io/support';
    shell.openExternal(url);
  };

  licenseClick = () => {
    const url = 'https://github.com/emeraldpay/emerald-wallet/blob/master/LICENSE';
    shell.openExternal(url);
  };

  onButtonClick = () => {
    const url = 'https://emerald.cash';
    shell.openExternal(url);
  };

  render() {
    const {os, version, gitVersion} = this.state;
    return (
      <ThemeProvider theme={Theme}>
        <About
          appVersion={version}
          gitVersion={gitVersion}
          osVersion={os}
          onButtonClick={this.onButtonClick}
          onHelpClick={this.onHelpClick}
          onLicenseClick={this.onLicenseClick}
        />
      </ThemeProvider>);
  }
}

export default AboutContainer;
