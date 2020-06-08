import { connection } from '@emeraldwallet/store';
import {IService} from './Services';
import {WebContents} from 'electron';

export class ConnStatus implements IService {
  public id: string;
  private webContents?: WebContents;
  private apiAccess: any;

  constructor(ipcMain: any, webContents: WebContents, apiAccess: any) {
    this.webContents = webContents;
    this.apiAccess = apiAccess;
    this.id = 'ConnectionStatusService';
  }

  public start(): void {
    this.apiAccess.statusListener((status: any) => {
      const action = connection.actions.setConnStatus(status);
      try {
        this.webContents?.send('store', action);
      } catch (e) {
        console.warn("Cannot send to the UI", e)
      }
    });
  }

  public stop(): void {
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

}
