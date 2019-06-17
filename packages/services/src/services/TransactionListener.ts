import { TxListener } from '../TxListener';
import { txhistory } from '@emeraldwallet/store';

export class TransactionListener {
  id: string;
  private apiAccess: any;
  private webContents: any;
  private ipcMain: any;
  private readonly chain: string;
  private subscriber: TxListener | null = null;

  constructor(chain: string, ipcMain: any, webContents: any, apiAccess: any) {
    this.webContents = webContents;
    this.apiAccess = apiAccess;
    if (chain === 'mainnet') {
      chain = 'etc';
    }
    this.chain = chain;
    this.ipcMain = ipcMain;
    this.id = `TransactionListener-${chain}`;
  }

  stop() {
    if (this.subscriber) {
      this.subscriber.stop();
    }
  }

  start() {
    this.stop();
    const subscriber = this.apiAccess.newTxListener(this.chain);
    this.subscriber = subscriber;
    const {webContents} = this;
    this.ipcMain.on('subscribe-tx', (_: any, hash: string) => {
      subscriber.subscribe(hash, (event: any) => {
        // console.log("update for tx", hash);
        const action = txhistory.actions.updateTxs([{
          chain: this.chain,
          hash: event.txid,
          blockNumber: event.blockNumber,
          timestamp: event.timestamp,
        }]);
        webContents.send('store', action);
      });
    });
  }
}
