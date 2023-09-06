import { Publisher, token as TokenApi } from '@emeraldpay/api';
import { EntryId } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  IpcCommands,
  Logger,
  SettingsManager,
  TokenRegistry,
  blockchainCodeToId,
} from '@emeraldwallet/core';
import { IpcMain } from 'electron';
import { EmeraldApiAccess } from '../emerald-client/ApiAccess';
import { BalanceService } from './balance/BalanceService';
import { Service } from './ServiceManager';

interface Subscription {
  address: string;
  blockchain: BlockchainCode;
  entryId: EntryId;
}

function isEqual(first: Subscription, second: Subscription): boolean {
  return first.address === second.address && first.blockchain === second.blockchain && first.entryId === second.entryId;
}

const log = Logger.forCategory('TokenService');

export class TokenService implements Service {
  readonly id = 'TokenService';

  private apiAccess: EmeraldApiAccess;
  private ipcMain: IpcMain;
  private tokenRegistry: TokenRegistry;
  private balanceService: BalanceService;

  private subscribers: Map<string, Publisher<TokenApi.AddressToken>> = new Map();
  private subscriptions: Subscription[] = [];

  constructor(
    ipcMain: IpcMain,
    apiAccess: EmeraldApiAccess,
    settings: SettingsManager,
    balanceService: BalanceService,
  ) {
    this.apiAccess = apiAccess;
    this.ipcMain = ipcMain;
    this.balanceService = balanceService;

    this.tokenRegistry = new TokenRegistry(settings.getTokens());

    ipcMain.handle(IpcCommands.TOKENS_SET_TOKENS, (event, tokens) => {
      this.tokenRegistry = new TokenRegistry(tokens);

      this.stop();
      this.start();
    });
  }

  start(): void {
    this.ipcMain.handle(
      IpcCommands.TOKENS_SUBSCRIBE_ADDRESS,
      (_event, entryId: EntryId, blockchain: BlockchainCode, address: string) =>
        this.createSubscription(entryId, blockchain, address),
    );

    this.subscriptions.forEach((subscription) => this.subscribeTokens(subscription));
  }

  stop(): void {
    this.ipcMain.removeHandler(IpcCommands.TOKENS_SUBSCRIBE_ADDRESS);

    this.subscribers.forEach((subscriber) => subscriber.cancel());
    this.subscribers.clear();
  }

  reconnect(): void {
    this.stop();
    this.start();
  }

  setWebContents(): void {
    // No need to send data to renderer process
  }

  private createSubscription(entryId: EntryId, blockchain: BlockchainCode, address: string): void {
    log.info(`Subscribing for ${address} on ${blockchain} blockchain...`);

    const subscription: Subscription = { address, blockchain, entryId };

    this.subscriptions = this.subscriptions.filter((item) => !isEqual(item, subscription));
    this.subscriptions.push(subscription);

    this.subscribeTokens(subscription);
  }

  private subscribeTokens({ address, blockchain, entryId }: Subscription): void {
    const tokens = this.tokenRegistry.byBlockchain(blockchain);

    const subscriber = this.apiAccess.tokenClient
      .subscribeTokens({
        address,
        blockchain: blockchainCodeToId(blockchain),
        contractAddresses: tokens.filter(({ pinned }) => !pinned).map(({ address }) => address),
      })
      .onData(({ contractAddresses }) =>
        tokens
          .filter(({ pinned }) => pinned)
          .map(({ address }) => address)
          .concat(contractAddresses)
          .forEach((contractAddress) =>
            this.balanceService.createSubscription(entryId, blockchain, address, contractAddress),
          ),
      )
      .onError((error) => log.error(`Error while subscribing for ${address} on ${blockchain} blockchain`, error));

    this.subscribers.set(`${entryId}:${blockchain}:${address}`, subscriber);
  }
}
