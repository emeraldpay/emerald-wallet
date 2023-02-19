import { AnyCurrency } from '@emeraldpay/api';
import { IpcCommands, Logger } from '@emeraldwallet/core';
import { PersistentStateManager } from '@emeraldwallet/persistent-state';
import { IpcMain, WebContents } from 'electron';
import { EmeraldApiAccess, PriceListener } from '../..';
import { IService } from '../Services';

const log = Logger.forCategory('PriceService');

class PricesService implements IService {
  public readonly id: string;

  private from: AnyCurrency[] = [];
  private to: AnyCurrency | null = null;

  private handler: NodeJS.Timeout | null = null;
  private listener: PriceListener | null = null;

  private apiAccess: EmeraldApiAccess;
  private persistentState: PersistentStateManager;
  private webContents?: WebContents;

  constructor(
    apiAccess: EmeraldApiAccess,
    ipcMain: IpcMain,
    persistentState: PersistentStateManager,
    webContents: WebContents,
    defaultFrom: string[],
  ) {
    this.id = 'PricesService';

    this.apiAccess = apiAccess;
    this.persistentState = persistentState;
    this.webContents = webContents;

    ipcMain.handle(IpcCommands.PRICES_SET_ASSETS, (event, from: string[]) => {
      log.info('Set prices sources:', from.join(', '));

      this.from = [...defaultFrom, ...from] as AnyCurrency[];

      this.stop();
      this.start();
    });

    ipcMain.handle(IpcCommands.PRICES_SET_CURRENCY, (event, to: string) => {
      log.info('Set prices target:', to);

      this.to = to.toUpperCase() as AnyCurrency;

      this.stop();
      this.start();
    });
  }

  start(): void {
    this.stop();

    this.listener = this.apiAccess.newPricesListener();

    this.fetch();
  }

  stop(): void {
    if (this.handler != null) {
      clearTimeout(this.handler);

      this.handler = null;
    }

    if (this.listener != null) {
      log.info('Closing prices listener');

      this.listener = null;
    }
  }

  reconnect(): void {
    // Timer based, so doesn't matter
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

  private fetch(): void {
    if (this.from.length > 0 && this.to != null) {
      log.info(`Request for prices from ${this.from.join(', ')} to ${this.to}`);

      this.listener?.request(this.from, this.to, (rates) =>
        this.persistentState.cache
          .put('rates', JSON.stringify(rates))
          .then(() =>
            this.webContents?.send(IpcCommands.STORE_DISPATCH, { type: 'ACCOUNT/EXCHANGE_RATES', payload: { rates } }),
          ),
      );
    }

    this.handler = setTimeout(this.fetch.bind(this), 60000);
  }
}

export default PricesService;
