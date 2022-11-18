import { IpcMain, WebContents } from 'electron';
import { IService } from './Services';
import { EmeraldApiAccess } from '..';

export class ConnStatus implements IService {
  public id: string;

  private apiAccess: EmeraldApiAccess;
  private webContents?: WebContents;

  constructor(ipcMain: IpcMain, webContents: WebContents, apiAccess: EmeraldApiAccess) {
    this.id = 'ConnectionStatusService';

    this.apiAccess = apiAccess;
    this.webContents = webContents;
  }

  public start(): void {
    this.apiAccess.statusListener((status) => {
      try {
        this.webContents?.send('store', { type: 'CONN/SET_STATUS', payload: { status } });
      } catch (exception) {
        console.warn('Cannot send to the UI', exception);
      }
    });
  }

  stop(): void {
    // Nothing
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

  reconnect(): void {
    // Nothing
  }
}
