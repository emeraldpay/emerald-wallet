import { IpcCommands } from '@emeraldwallet/core';
import { IpcMain, WebContents } from 'electron';
import { IService } from './Services';
import { EmeraldApiAccess } from '..';

export class ConnectionStatus implements IService {
  public id: string;

  private apiAccess: EmeraldApiAccess;
  private webContents?: WebContents;

  constructor(ipcMain: IpcMain, webContents: WebContents, apiAccess: EmeraldApiAccess) {
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
