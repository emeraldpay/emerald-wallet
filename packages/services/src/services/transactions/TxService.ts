import { BlockchainCode, IStoredTransaction, Logger } from '@emeraldwallet/core';
import { txhistory } from '@emeraldwallet/store';
import { IpcMain, WebContents } from 'electron';
import { EmeraldApiAccess } from '../..';
import { IService } from '../Services';
import { TxListener } from './TxListener';

const log = Logger.forCategory('TxService');

export class TxService implements IService {
  public id: string;

  private apiAccess: EmeraldApiAccess;
  private ipcMain: IpcMain;
  private subscriber: TxListener[] = [];
  private webContents?: WebContents;

  constructor(ipcMain: IpcMain, webContents: WebContents, apiAccess: EmeraldApiAccess) {
    this.id = 'TransactionListener';

    this.apiAccess = apiAccess;
    this.ipcMain = ipcMain;
    this.webContents = webContents;
  }

  public start(): void {
    this.ipcMain.on('subscribe-tx', (event, blockchain: BlockchainCode, hash: string) => {
      const subscriber = this.apiAccess.newTxListener();

      this.subscriber.push(subscriber);

      subscriber.subscribe(blockchain, hash, (event) => {
        // TODO TxStore
        const tx = {
          blockchain,
          blockNumber: event.blockNumber,
          broadcasted: event.broadcasted,
          hash: event.txid,
          timestamp: event.timestamp == null ? new Date() : new Date(event.timestamp),
        } as IStoredTransaction;

        const action = txhistory.actions.updateTxs([tx]);

        try {
          this.webContents?.send('store', action);
        } catch (e) {
          log.warn('Cannot send to the UI', e);
        }
      });
    });
  }

  public stop(): void {
    this.subscriber.forEach((subscribe) => subscribe.stop());
    this.subscriber = [];
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

  reconnect(): void {
    this.stop();
    this.start();
  }
}
