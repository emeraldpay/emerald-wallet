import { Publisher, token as TokenApi } from '@emeraldpay/api';
import { EntryId } from '@emeraldpay/emerald-vault-core';
import { extractWalletId } from '@emeraldpay/emerald-vault-core/lib/types';
import {
  BlockchainCode,
  IpcCommands,
  Logger,
  PersistentState,
  SettingsManager,
  TokenData,
  TokenRegistry,
  blockchainCodeToId,
  blockchainIdToCode,
} from '@emeraldwallet/core';
import { PersistentStateManager } from '@emeraldwallet/persistent-state';
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

type AllowanceHandler = (allowance: TokenApi.AddressAllowanceAmount) => void;

const log = Logger.forCategory('AllowanceService');

export class AllowanceService implements Service {
  readonly id = 'AllowanceService';

  private readonly cacheTtl = 24 * 60 * 60 * 1000;

  private apiAccess: EmeraldApiAccess;
  private balanceService: BalanceService;
  private ipcMain: IpcMain;
  private persistentState: PersistentStateManager;
  private tokens: TokenData[];
  private tokenRegistry: TokenRegistry;
  private webContents: WebContents;

  private subscribers: Map<string, Publisher<TokenApi.AddressAllowanceAmount>> = new Map();
  private subscriptions: Subscription[] = [];

  constructor(
    ipcMain: IpcMain,
    apiAccess: EmeraldApiAccess,
    settings: SettingsManager,
    persistentState: PersistentStateManager,
    webContents: WebContents,
    balanceService: BalanceService,
  ) {
    this.apiAccess = apiAccess;
    this.ipcMain = ipcMain;
    this.persistentState = persistentState;
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

    const request: TokenApi.AddressAllowanceRequest = {
      address,
      blockchain: blockchainCodeToId(blockchain),
      contractAddresses: tokens.map(({ address }) => address),
    };

    const handler = this.processAllowance(entryId, address);

    const timestamp = Date.now() - 10;

    let failed = false;

    this.apiAccess.tokenClient
      .getAllowanceAmounts(request)
      .onData(handler)
      .onError((error) => {
        log.error(`Error while getting allowances for ${address} on ${blockchain} blockchain`, error);

        failed = true;
      })
      .finally(() => {
        if (!failed) {
          this.persistentState.allowances.remove(extractWalletId(entryId), blockchain, timestamp).then(() =>
            this.webContents.send(IpcCommands.STORE_DISPATCH, {
              type: 'WALLET/ALLOWANCE/REMOVE_ALLOWANCE',
              payload: { address, blockchain, timestamp },
            }),
          );
        }
      });

    const subscriber = this.apiAccess.tokenClient
      .subscribeAllowanceAmounts(request)
      .onData(handler)
      .onError((error) => log.error(`Error while subscribing for ${address} on ${blockchain} blockchain`, error));

    this.subscribers.set(`${blockchain}:${address}`, subscriber);
  }

  private processAllowance(entryId: EntryId, address: string): AllowanceHandler {
    const walletId = extractWalletId(entryId);

    return ({ allowance, available, blockchain, contractAddress, ownerAddress, spenderAddress }) => {
      const blockchainCode = blockchainIdToCode(blockchain);

      const cachedAllowance: PersistentState.CachedAllowance = {
        amount: allowance,
        blockchain: blockchainCode,
        owner: ownerAddress,
        spender: spenderAddress,
        token: contractAddress,
      };

      this.persistentState.allowances.add(walletId, cachedAllowance, this.cacheTtl).then(() => {
        this.balanceService.createSubscription(entryId, blockchainCode, ownerAddress, contractAddress);

        Promise.all([
          this.apiAccess.addressClient.describe({ blockchain, address: ownerAddress }),
          this.apiAccess.addressClient.describe({ blockchain, address: spenderAddress }),
        ]).then(([{ control: ownerControl }, { control: spenderControl }]) =>
          this.webContents.send(IpcCommands.STORE_DISPATCH, {
            type: 'WALLET/ALLOWANCE/SET_ALLOWANCE',
            payload: {
              allowance: {
                address,
                allowance,
                available,
                contractAddress,
                ownerAddress,
                ownerControl,
                spenderAddress,
                spenderControl,
                blockchain: blockchainCode,
                timestamp: Date.now(),
              },
              tokens: this.tokens,
            },
          }),
        );
      });
    };
  }
}
