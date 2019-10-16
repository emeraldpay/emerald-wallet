import { txhistory } from '@emeraldwallet/store';
import { TxListener } from './TxListener';

export class TransactionListener {
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
    const { webContents } = this;
    this.ipcMain.on('subscribe-tx', (_: any, blockchain: string, hash: string) => {
      const subscriber = this.apiAccess.newTxListener();
      this.subscriber.push(subscriber);
      subscriber.subscribe(blockchain, hash, (event: any) => {
        // console.log("update for tx", hash);
        const action = txhistory.actions.updateTxs([{
          blockchain,
          hash: event.txid,
          blockNumber: event.blockNumber,
          timestamp: event.timestamp,
          broadcasted: event.broadcasted
        }]);
        webContents.send('store', action);
      });
    });
  }
}
