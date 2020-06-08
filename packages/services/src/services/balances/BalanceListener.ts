import { IFrontApp, Logger } from '@emeraldwallet/core';
import { accounts } from '@emeraldwallet/store';
import { IService } from '../Services';
import {AddressListener} from './AddressListener';
import {WebContents} from 'electron';

const log = Logger.forCategory('BalanceService');

export class BalanceListener implements IService {
  public id: string;
  private apiAccess: any;
  private webContents?: WebContents;
  private ipcMain: any;
  private subscribers: AddressListener[];

  constructor(ipcMain: any, webContents: WebContents, apiAccess: any) {
    this.ipcMain = ipcMain;
    this.webContents = webContents;
    this.apiAccess = apiAccess;
    this.id = `BalanceIpcListener`;
    this.subscribers = [];
  }

  public stop () {
    this.subscribers.forEach((s) => s.stop());
  }

  public start () {
    this.ipcMain.on('subscribe-balance', (_: any, blockchain: string, addresses: string[]) => {
      if (blockchain === 'mainnet') {
        blockchain = 'etc';
      }
      const subscriber = this.apiAccess.newAddressListener();
      this.subscribers.push(subscriber);
      subscriber.subscribe(blockchain, addresses, (event: any) => {
        log.debug(JSON.stringify(event));
        const action = accounts.actions.setBalanceAction({
          blockchain,
          address: event.address,
          value: event.balance,
          asset: 'ether' // TODO
        });
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

}
