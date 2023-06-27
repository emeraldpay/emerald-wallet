import { IpcCommands } from '@emeraldwallet/core';
import { WebContents } from 'electron';
import { EmeraldApiAccess } from '..';
import { IService } from './Services';

export class ConnectionStatus implements IService {
  readonly id: string;

  private apiAccess: EmeraldApiAccess;
  private webContents?: WebContents;

  constructor(
    ipcMain: Electron.CrossProcessExports.IpcMain,
    apiAccess: EmeraldApiAccess,
    webContents: Electron.CrossProcessExports.WebContents,
  ) {
    this.id = 'ConnectionStatusService';

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
