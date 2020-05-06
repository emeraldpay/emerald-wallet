import { txhistory } from '@emeraldwallet/store';
import { IService } from '../Services';
import { TxListener } from './TxListener';

export class TransactionListener implements IService {
  public id: string;
  private apiAccess: any;
  private webContents: any;
  private ipcMain: any;
  private subscriber: TxListener[] = [];

  constructor (ipcMain: any, webContents: any, apiAccess: any) {
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
        this.webContents.send('store', action);
      });
    });
  }
}
