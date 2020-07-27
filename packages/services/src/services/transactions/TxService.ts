import {txhistory} from '@emeraldwallet/store';
import {IService} from '../Services';
import {TxListener} from './TxListener';
import {WebContents} from 'electron';
import {Logger} from "@emeraldwallet/core";
import {EmeraldApiAccess} from "../..";

const log = Logger.forCategory('TxService');

export class TxService implements IService {
  public id: string;
  private apiAccess: EmeraldApiAccess;
  private webContents?: WebContents;
  private ipcMain: any;
  private subscriber: TxListener[] = [];

  constructor(ipcMain: any, webContents: WebContents, apiAccess: EmeraldApiAccess) {
    this.webContents = webContents;
    this.apiAccess = apiAccess;
    this.ipcMain = ipcMain;
    this.id = `TransactionListener`;
  }

  public stop () {
    this.subscriber.forEach((x) => x.stop());
    this.subscriber = [];
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
          log.warn("Cannot send to the UI", e)
        }
      });
    });
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

  reconnect(): void {
    this.stop();
    this.start();
  }

}
