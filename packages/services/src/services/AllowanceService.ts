import { AddressAllowanceResponse, Publisher } from '@emeraldpay/api';
import {
  BlockchainCode,
  IpcCommands,
  Logger,
  SettingsManager,
  TokenData,
  TokenRegistry,
  blockchainCodeToId,
  blockchainIdToCode,
} from '@emeraldwallet/core';
import { IpcMain, WebContents } from 'electron';
import { EmeraldApiAccess } from '../emerald-client/ApiAccess';
import { Service } from './ServiceManager';

interface Subscription {
  address: string;
  blockchain: BlockchainCode;
}

function isEqual(first: Subscription, second: Subscription): boolean {
  return first.address === second.address && first.blockchain === second.blockchain;
}

const log = Logger.forCategory('AllowanceService');

export class AllowanceService implements Service {
  readonly id = 'AllowanceService';

  private apiAccess: EmeraldApiAccess;
  private ipcMain: IpcMain;
  private tokens: TokenData[];
  private tokenRegistry: TokenRegistry;
  private webContents: WebContents;

  private subscribers: Map<string, Publisher<AddressAllowanceResponse>> = new Map();
  private subscriptions: Subscription[] = [];

  constructor(ipcMain: IpcMain, apiAccess: EmeraldApiAccess, settings: SettingsManager, webContents: WebContents) {
    this.apiAccess = apiAccess;
    this.ipcMain = ipcMain;
    this.webContents = webContents;

    this.tokens = settings.getTokens();
    this.tokenRegistry = new TokenRegistry(this.tokens);

    ipcMain.handle(IpcCommands.ALLOWANCE_SET_TOKENS, (event, tokens) => {
      this.tokens = tokens;
      this.tokenRegistry = new TokenRegistry(tokens);

      this.stop();
      this.start();
    });
  }

  start(): void {
    this.ipcMain.handle(
      IpcCommands.ALLOWANCE_SUBSCRIBE_ADDRESS,
      (_event, blockchain: BlockchainCode, address: string) => this.createSubscription(blockchain, address),
    );

    this.subscriptions.forEach((subscription) => this.subscribeAllowance(subscription));
  }

  stop(): void {
    this.ipcMain.removeHandler(IpcCommands.ALLOWANCE_SUBSCRIBE_ADDRESS);

    this.subscribers.forEach((subscriber) => subscriber.cancel());
    this.subscribers.clear();
  }

  reconnect(): void {
    this.stop();
    this.start();
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

  private createSubscription(blockchain: BlockchainCode, address: string): void {
    log.info(`Subscribing for ${address} on ${blockchain} blockchain...`);

    const subscription: Subscription = { address, blockchain };

    this.subscriptions = this.subscriptions.filter((item) => !isEqual(item, subscription));
    this.subscriptions.push(subscription);

    this.subscribeAllowance(subscription);
  }

  private subscribeAllowance({ address, blockchain }: Subscription): void {
    const tokens = this.tokenRegistry.byBlockchain(blockchain);

    const subscriber = this.apiAccess.blockchainClient
      .subscribeAddressAllowance({
        address,
        chain: blockchainCodeToId(blockchain),
        contractAddresses: tokens.map(({ address }) => address),
      })
      .onData(({ allowance, available, chain, contractAddress, ownerAddress, spenderAddress }) =>
        this.webContents.send(IpcCommands.STORE_DISPATCH, {
          type: 'WALLET/ALLOWANCE/SET_ADDRESS_ALLOWANCE',
          payload: {
            allowance: {
              address,
              allowance,
              available,
              contractAddress,
              ownerAddress,
              spenderAddress,
              blockchain: blockchainIdToCode(chain),
            },
            tokens: this.tokens,
          },
        }),
      )
      .onError((error) => log.error(`Error while subscribing for ${address} on ${blockchain} blockchain`, error));

    this.subscribers.set(`${blockchain}:${address}`, subscriber);
  }
}
