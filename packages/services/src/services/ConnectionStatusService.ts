import { IpcCommands } from '@emeraldwallet/core';
import { IpcMain, WebContents } from 'electron';
import { EmeraldApiAccess } from '..';
import { Service } from './ServiceManager';

export class ConnectionStatusService implements Service {
  readonly id = 'ConnectionStatusService';

  private apiAccess: EmeraldApiAccess;
  private webContents?: WebContents;

  constructor(ipcMain: IpcMain, apiAccess: EmeraldApiAccess, webContents: WebContents) {
    this.apiAccess = apiAccess;
    this.webContents = webContents;
  }

  start(): void {
    this.apiAccess.statusListener((status) =>
      this.webContents?.send(IpcCommands.STORE_DISPATCH, { type: 'CONNECTION/SET_STATUS', payload: { status } }),
    );
  }

  stop(): void {
    // Nothing
  }

  reconnect(): void {
    // Nothing
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }
}
