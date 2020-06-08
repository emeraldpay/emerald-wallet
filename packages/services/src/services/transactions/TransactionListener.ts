import { txhistory } from '@emeraldwallet/store';
import { IService } from '../Services';
import {TxListener} from './TxListener';
import {WebContents} from 'electron';

export class TransactionListener implements IService {
  public id: string;
  private apiAccess: any;
  private webContents?: WebContents;
  private ipcMain: any;
  private subscriber: TxListener[] = [];

  constructor(ipcMain: any, webContents: WebContents, apiAccess: any) {
    this.webContents = webContents;
    this.apiAccess = apiAccess;
    this.ipcMain = ipcMain;
    this.id = `TransactionListener`;
  }

  public stop () {
    this.subscriber.forEach((x) => x.stop());
  }

  public start () {
    this.ipcMain.on('subscribe-tx', (_: any, blockchain: string, hash: string) => {
      const subscriber = this.apiAccess.newTxListener();
      this.subscriber.push(subscriber);
      subscriber.subscribe(blockchain, hash, (event: any) => {
        const action = txhistory.actions.updateTxs([{
          blockchain,
          hash: event.txid,
          blockNumber: event.blockNumber,
          timestamp: event.timestamp,
          broadcasted: event.broadcasted
        }]);
        try {
          this.webContents?.send('store', action);
        } catch (e) {
          console.warn("Cannot send to the UI", e)
        }
      });
    });
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

}
