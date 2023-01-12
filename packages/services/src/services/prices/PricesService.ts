import { AnyCurrency } from '@emeraldpay/api';
import { Logger } from '@emeraldwallet/core';
import { IpcMain, WebContents } from 'electron';
import { EmeraldApiAccess, PriceListener } from '../..';
import { IService } from '../Services';

const log = Logger.forCategory('PriceService');

class PricesService implements IService {
  public readonly id: string;

  private readonly from: AnyCurrency[];

  private ipcMain: IpcMain;
  private apiAccess: EmeraldApiAccess;
  private webContents?: WebContents;
  private to: AnyCurrency;

  private listener: PriceListener | null = null;
  private handler: NodeJS.Timeout | null = null;

  constructor(ipcMain: IpcMain, webContents: WebContents, apiAccess: EmeraldApiAccess, from: string[], to: string) {
    this.id = 'PricesService';

    this.apiAccess = apiAccess;
    this.from = from as AnyCurrency[];
    this.ipcMain = ipcMain;
    this.to = to as AnyCurrency;
    this.webContents = webContents;

    this.ipcMain.on('prices/setCurrency', (event, to: string) => {
      to = to.toUpperCase();

      log.info('Set prices target', to);

      if (this.to !== to) {
        this.to = to as AnyCurrency;

        this.stop();
        this.start();
      }

      event.returnValue = 'ok';
    });
  }

  start(): void {
    this.stop();

    this.listener = this.apiAccess.newPricesListener();

    this.fetch();
  }

  fetch(): void {
    log.info(`Request for prices from ${this.from.join(', ')} to ${this.to}`);

    this.listener?.request(this.from, this.to, (rates) => {
      try {
        this.webContents?.send('store', { type: 'ACCOUNT/EXCHANGE_RATES', payload: { rates } });
      } catch (exception) {
        log.warn('Cannot send to the UI', exception);
      }
    });

    this.handler = setTimeout(this.fetch.bind(this), 60000);
  }

  stop(): void {
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
    // Timer based, so doesn't matter
  }
}

export default PricesService;
