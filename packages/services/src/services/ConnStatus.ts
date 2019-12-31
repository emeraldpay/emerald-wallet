import { connection } from '@emeraldwallet/store';
import { IService } from './Services';

export class ConnStatus implements IService {
  public id: string;
  private webContents: any;
  private apiAccess: any;

  constructor (ipcMain: any, webContents: any, apiAccess: any) {
    this.webContents = webContents;
    this.apiAccess = apiAccess;
    this.id = 'ConnectionStatusService';
  }
  public start (): void {
    this.apiAccess.statusListener((status: any) => {
      const action = connection.actions.setConnStatus(status);
      this.webContents.send('store', action);
    });
  }

  public stop (): void {
  }
}
