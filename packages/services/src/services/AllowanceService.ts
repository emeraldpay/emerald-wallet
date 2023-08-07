import { AddressAllowanceResponse, Publisher } from '@emeraldpay/api';
import { EntryId } from '@emeraldpay/emerald-vault-core';
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

const log = Logger.forCategory('AllowanceService');

export class AllowanceService implements Service {
  readonly id = 'AllowanceService';

  private apiAccess: EmeraldApiAccess;
  private balanceService: BalanceService;
  private ipcMain: IpcMain;
  private tokens: TokenData[];
  private tokenRegistry: TokenRegistry;
  private webContents: WebContents;

  private subscribers: Map<string, Publisher<AddressAllowanceResponse>> = new Map();
  private subscriptions: Subscription[] = [];

  constructor(
    ipcMain: IpcMain,
    apiAccess: EmeraldApiAccess,
    settings: SettingsManager,
    webContents: WebContents,
    balanceService: BalanceService,
  ) {
    this.apiAccess = apiAccess;
    this.ipcMain = ipcMain;
    this.webContents = webContents;
    this.balanceService = balanceService;

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
      (_event, entryId: EntryId, blockchain: BlockchainCode, address: string) =>
        this.createSubscription(entryId, blockchain, address),
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

  private createSubscription(entryId: EntryId, blockchain: BlockchainCode, address: string): void {
    log.info(`Subscribing for ${address} on ${blockchain} blockchain...`);

    const subscription: Subscription = { address, blockchain, entryId };

    this.subscriptions = this.subscriptions.filter((item) => !isEqual(item, subscription));
    this.subscriptions.push(subscription);

    this.subscribeAllowance(subscription);
  }

  private subscribeAllowance({ address, blockchain, entryId }: Subscription): void {
    const tokens = this.tokenRegistry.byBlockchain(blockchain);

    const subscriber = this.apiAccess.blockchainClient
      .subscribeAddressAllowance({
        address,
        chain: blockchainCodeToId(blockchain),
        contractAddresses: tokens.map(({ address }) => address),
      })
      .onData(({ allowance, available, chain, contractAddress, ownerAddress, spenderAddress }) => {
        this.balanceService.createSubscription(entryId, blockchain, ownerAddress, contractAddress);

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
        });
      })
      .onError((error) => log.error(`Error while subscribing for ${address} on ${blockchain} blockchain`, error));

    this.subscribers.set(`${blockchain}:${address}`, subscriber);
  }
}
