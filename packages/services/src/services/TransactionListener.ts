import { TxListener } from '../TxListener';
import { txhistory } from '@emeraldwallet/store';

export class TransactionListener {
  id: string;
  private apiAccess: any;
  private webContents: any;
  private ipcMain: any;
  private subscriber: TxListener[] = [];

  constructor(ipcMain: any, webContents: any, apiAccess: any) {
    this.webContents = webContents;
    this.apiAccess = apiAccess;
    this.ipcMain = ipcMain;
    this.id = `TransactionListener`;
  }

  stop() {
    this.subscriber.forEach((x) => x.stop());
  }

  start() {
    const {webContents} = this;
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
        }]);
        webContents.send('store', action);
      });
    });
  }
}
