import { IpcCommands, Versions } from '@emeraldwallet/core';
import { About } from '@emeraldwallet/react-app';
import { EmeraldTheme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@mui/styles';
import { ipcRenderer, shell } from 'electron';
import * as React from 'react';

interface State {
  versions: Versions | undefined;
}

export class AboutComponent extends React.Component<unknown, State> {
  componentDidMount(): void {
    ipcRenderer.invoke(IpcCommands.GET_VERSION).then((versions) => this.setState({ versions }));
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
    const { versions } = this.state;

    return (
      <ThemeProvider theme={EmeraldTheme}>
        {versions != null && (
          <About
            versions={versions}
            onHelpClick={this.onHelpClick}
            onLicenseClick={this.onLicenseClick}
            onWebsiteClick={this.onWebsiteClick}
          />
        )}
      </ThemeProvider>
    );
  }
}
