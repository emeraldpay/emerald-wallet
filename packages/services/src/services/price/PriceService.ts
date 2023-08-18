import { AnyCurrency, isErc20Asset } from '@emeraldpay/api';
import { BlockchainCode, EthereumAddress, IpcCommands, Logger, blockchainCodeToId } from '@emeraldwallet/core';
import { PersistentStateManager } from '@emeraldwallet/persistent-state';
import { IpcMain, WebContents } from 'electron';
import { EmeraldApiAccess, PriceListener } from '../..';
import { Service } from '../ServiceManager';

const log = Logger.forCategory('PriceService');

export class PriceService implements Service {
  readonly id = 'PriceService';

  private from: AnyCurrency[] = [];
  private to: AnyCurrency | null = null;

  private listener: PriceListener | null = null;

  private repeater: NodeJS.Timeout | null = null;
  private timeout: NodeJS.Timeout | null = null;

  private apiAccess: EmeraldApiAccess;
  private persistentState: PersistentStateManager;
  private webContents?: WebContents;

  constructor(
    ipcMain: IpcMain,
    apiAccess: EmeraldApiAccess,
    persistentState: PersistentStateManager,
    webContents: WebContents,
  ) {
    this.apiAccess = apiAccess;
    this.persistentState = persistentState;
    this.webContents = webContents;

    ipcMain.handle(IpcCommands.PRICES_SET_TO, (event, to: string) => {
      log.info(`Set target to ${to}`);

      this.to = to.toUpperCase() as AnyCurrency;

      this.stop();
      this.start();
    });
  }

  start(): void {
    this.listener = this.apiAccess.newPriceListener();
    this.timeout = setTimeout(this.fetch.bind(this), 2 * 1000);
  }

  stop(): void {
    this.listener = null;

    if (this.repeater != null) {
      clearTimeout(this.repeater);
    }

    if (this.timeout != null) {
      clearTimeout(this.timeout);
    }
  }

  reconnect(): void {
    // Timer based
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

  addFrom(from: string, blockchain?: BlockchainCode): void {
    let currency: AnyCurrency | undefined;

    if (EthereumAddress.isValid(from)) {
      if (blockchain != null) {
        const blockchainId = blockchainCodeToId(blockchain);

        const asset = this.from.find((asset) =>
          isErc20Asset(asset) ? asset.blockchain === blockchainId && asset.contractAddress === from : false,
        );

        if (asset == null) {
          log.info(`Add base ${from} on ${blockchain} blockchain`);

          currency = {
            blockchain: blockchainId,
            contractAddress: from,
          };
        }
      }
    } else {
      const coin = from.toUpperCase() as AnyCurrency;

      if (!this.from.includes(coin)) {
        log.info(`Add base ${coin}`);

        currency = coin;
      }
    }

    if (currency != null) {
      this.from = [...this.from, currency];

      this.stop();
      this.start();
    }
  }

  private fetch(): void {
    if (this.from.length > 0 && this.to != null) {
      const from = this.from
        .map((item) => (isErc20Asset(item) ? `${item.contractAddress} on ${item.blockchain} blockchain` : item))
        .join(', ');
      const to = isErc20Asset(this.to) ? this.to.contractAddress : this.to;

      log.info(`Request for prices from ${from} to ${to}`);

      this.listener?.request(this.from, this.to, (rates) =>
        this.persistentState.cache
          .put('rates', JSON.stringify(rates))
          .then(
            () => this.webContents?.send(IpcCommands.STORE_DISPATCH, { type: 'ACCOUNT/SET_RATES', payload: { rates } }),
          ),
      );
    }

    this.repeater = setTimeout(this.fetch.bind(this), 60 * 1000);
  }
}
