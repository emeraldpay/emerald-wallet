import { Logger } from '@emeraldwallet/core';
import { settings } from '@emeraldwallet/store';
import {IService} from '../Services';
import {WebContents} from 'electron';
import {EmeraldApiAccess} from "../..";

const log = Logger.forCategory('PriceService');

class PricesService implements IService {
  public id: string;
  private ipcMain: any;
  private apiAccess: EmeraldApiAccess;
  private webContents?: WebContents;
  private froms: any;
  private to: any;
  private listener: any | null;
  private handler: NodeJS.Timeout | null;

  constructor(ipcMain: any, webContents: WebContents, apiAccess: EmeraldApiAccess, from: any, currency: any) {
    this.id = 'PricesService';
    this.ipcMain = ipcMain;
    this.webContents = webContents;
    this.froms = from;
    this.to = currency;
    this.apiAccess = apiAccess;
    this.handler = null;

    this.ipcMain.on('prices/setCurrency', (event: any, to: string) => {
      to = to.toUpperCase();
      log.info('set prices target', to);
      if (this.to !== to) {
        this.to = to;
        this.stop();
        this.start();
      }
      event.returnValue = 'ok';
    });
  }

  public start () {
    this.stop();
    this.listener = this.apiAccess.newPricesListener();
    this.fetch();
  }

  public fetch () {
    log.info(`Request for prices, ${this.froms} to ${this.to}`);
    this.listener.request(this.froms, this.to, (result: any) => {
      try {
        this.webContents?.send('store', settings.actions.setRatesAction(result));
      } catch (e) {
        log.warn("Cannot send to the UI", e)
      }
    });
    this.handler = setTimeout(this.fetch.bind(this), 60000);
  }

  public stop () {
    if (this.handler) {
      clearTimeout(this.handler);
      this.handler = null;
    }
    if (this.listener) {
      log.info('Closing prices listener');
      this.listener.stop();
      this.listener = null;
    }
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

  reconnect(): void {
    //timer based, so doesn't matter
  }

}

export default PricesService;
