import { IpcCommands, Versions } from '@emeraldwallet/core';
import { About } from '@emeraldwallet/react-app';
import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/core/styles';
import { ipcRenderer, shell } from 'electron';
import * as React from 'react';

export class AboutComponent extends React.Component<unknown, Versions> {
  constructor(props) {
    super(props);

    this.state = {
      appVersion: '0.0.0',
      gitVersion: {},
      osVersion: {},
    };
  }

  componentDidMount(): void {
    ipcRenderer.invoke(IpcCommands.GET_VERSION).then((result) =>
      this.setState({
        appVersion: result.version,
        gitVersion: result.gitVersion,
        osVersion: result.os,
      }),
    );
  }

  onHelpClick = async (): Promise<void> => {
    await shell.openExternal('https://go.emrld.io/support');
  };

  onLicenseClick = async (): Promise<void> => {
    await shell.openExternal('https://github.com/emeraldpay/emerald-wallet/blob/master/LICENSE');
  };

  onWebsiteClick = async (): Promise<void> => {
    await shell.openExternal('https://emerald.cash');
  };

  render(): React.ReactNode {
    const { gitVersion, osVersion, appVersion } = this.state;

    return (
      <ThemeProvider theme={Theme}>
        <About
          appVersion={appVersion}
          gitVersion={gitVersion}
          osVersion={osVersion}
          onHelpClick={this.onHelpClick}
          onLicenseClick={this.onLicenseClick}
          onWebsiteClick={this.onWebsiteClick}
        />
      </ThemeProvider>
    );
  }
}
