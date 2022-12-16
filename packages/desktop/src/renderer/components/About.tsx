import { IpcCommands } from '@emeraldwallet/core';
import { About } from '@emeraldwallet/react-app/lib/app/AboutDialog/About/About';
import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/core/styles';
import { ipcRenderer, shell } from 'electron';
import * as React from 'react';

interface AboutState {
  gitVersion: string;
  os: string;
  version: string;
}

export class AboutComponent extends React.Component<unknown, AboutState> {
  constructor(props) {
    super(props);

    this.state = {
      gitVersion: '0.0.0',
      os: 'unknown',
      version: '0.0.0',
    };
  }

  componentDidMount(): void {
    ipcRenderer.invoke(IpcCommands.GET_VERSION).then((result) =>
      this.setState({
        os: result.os,
        version: result.version,
        gitVersion: result.gitVersion,
      }),
    );
  }

  onHelpClick = async (): Promise<void> => {
    await shell.openExternal('https://go.emrld.io/support');
  };

  onLicenseClick = async (): Promise<void> => {
    await shell.openExternal('https://github.com/emeraldpay/emerald-wallet/blob/master/LICENSE');
  };

  onButtonClick = async (): Promise<void> => {
    await shell.openExternal('https://emerald.cash');
  };

  render(): React.ReactNode {
    const { gitVersion, os, version } = this.state;

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
      </ThemeProvider>
    );
  }
}
