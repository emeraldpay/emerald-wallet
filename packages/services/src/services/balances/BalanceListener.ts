import { isAsset } from '@emeraldpay/api';
import { EntryId } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  Blockchains,
  IpcCommands,
  Logger,
  SettingsManager,
  TokenRegistry,
  amountFactory,
  blockchainCodeToId,
} from '@emeraldwallet/core';
import { PersistentStateManager } from '@emeraldwallet/persistent-state';
import { IpcMain, WebContents } from 'electron';
import { EmeraldApiAccess } from '../..';
import { PricesService } from '../prices/PricesService';
import { IService } from '../Services';
import { AddressListener } from './AddressListener';

interface Subscription {
  address: string;
  asset: string;
  blockchain: BlockchainCode;
  entryId: EntryId;
}

function isEqual(first: Subscription, second: Subscription): boolean {
  return (
    first.address === second.address &&
    first.asset === second.asset &&
    first.blockchain === second.blockchain &&
    first.entryId === second.entryId
  );
}

const log = Logger.forCategory('BalanceService');

export class BalanceListener implements IService {
  readonly id: string;

  private apiAccess: EmeraldApiAccess;
  private ipcMain: IpcMain;
  private persistentState: PersistentStateManager;
  private pricesService: PricesService;
  private tokenRegistry: TokenRegistry;
  private webContents: WebContents;

  private subscribers: Map<string, AddressListener> = new Map();
  private subscriptions: Subscription[] = [];

  constructor(
    ipcMain: Electron.CrossProcessExports.IpcMain,
    apiAccess: EmeraldApiAccess,
    settings: SettingsManager,
    pricesService: PricesService,
    persistentState: PersistentStateManager,
    webContents: Electron.CrossProcessExports.WebContents,
  ) {
    this.id = 'BalanceIpcListener';

    this.apiAccess = apiAccess;
    this.ipcMain = ipcMain;
    this.persistentState = persistentState;
    this.pricesService = pricesService;
    this.tokenRegistry = new TokenRegistry(settings.getTokens());
    this.webContents = webContents;

    ipcMain.handle(IpcCommands.BALANCE_SET_TOKENS, (event, tokens) => {
      this.tokenRegistry = new TokenRegistry(tokens);

      this.stop();
      this.start();
    });
  }

  start(): void {
    this.ipcMain.handle(
      IpcCommands.BALANCE_SUBSCRIBE,
      (_event, entryId: EntryId, blockchain: BlockchainCode, address: string, asset: string) => {
        if (Array.isArray(address)) {
          address.forEach((item) => this.createSubscription(entryId, blockchain, item, asset));
        } else {
          this.createSubscription(entryId, blockchain, address, asset);
        }
      },
    );

    this.subscriptions.forEach((subscription) => this.subscribeBalance(subscription));
  }

  stop(): void {
    this.ipcMain.removeHandler(IpcCommands.BALANCE_SUBSCRIBE);

    this.subscribers.forEach((subscription) => subscription.stop());
    this.subscribers.clear();
  }

  reconnect(): void {
    this.stop();
    this.start();
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

  createSubscription(entryId: EntryId, blockchain: BlockchainCode, address: string, asset: string): void {
    log.info(`Subscribing for ${address} asset ${asset} on ${blockchain} blockchain...`);

    const subscription: Subscription = { address, blockchain, entryId, asset };

    this.subscriptions = this.subscriptions.filter((item) => !isEqual(item, subscription));
    this.subscriptions.push(subscription);

    this.subscribeBalance(subscription);
  }

  private subscribeBalance({ address, asset, blockchain, entryId }: Subscription): void {
    const subscriber = this.apiAccess.newAddressListener();

    const factory = amountFactory(blockchain);

    subscriber.subscribe(blockchain, address, asset, ({ balance, utxo, address: eventAddress, asset: eventAsset }) => {
      const {
        params: { coinTicker },
      } = Blockchains[blockchain];

      this.persistentState.balances
        .set({
          address: eventAddress,
          amount: balance,
          asset: isAsset(eventAsset) ? coinTicker : eventAsset.contractAddress,
          blockchain: blockchainCodeToId(blockchain),
          utxo: utxo?.map(({ txid, vout, value: amount }) => ({ amount, txid, vout })),
        })
        .then(() => {
          if (isAsset(eventAsset)) {
            const amount = factory(balance);

            if (amount.isPositive()) {
              this.pricesService.addFrom(coinTicker);
            }

            this.webContents.send(IpcCommands.STORE_DISPATCH, {
              type: 'ACCOUNT/SET_BALANCE',
              payload: {
                entryId,
                address: eventAddress,
                balance: amount.encode(),
                utxo: utxo?.map((utxo) => ({
                  address: eventAddress,
                  txid: utxo.txid,
                  value: factory(utxo.value).encode(),
                  vout: utxo.vout,
                })),
              },
            });
          } else {
            const { contractAddress } = eventAsset;

            if (this.tokenRegistry.hasAddress(blockchain, contractAddress)) {
              const token = this.tokenRegistry.byAddress(blockchain, contractAddress);

              if (token.getAmount(balance).isPositive()) {
                this.pricesService.addFrom(contractAddress, blockchain);
              }

              this.webContents.send(IpcCommands.STORE_DISPATCH, {
                type: 'TOKENS/SET_TOKEN_BALANCE',
                payload: {
                  blockchain,
                  entryId,
                  address: eventAddress,
                  balance: {
                    decimals: token.decimals,
                    symbol: token.symbol,
                    unitsValue: balance,
                  },
                  contractAddress: token.address,
                },
              });
            }
          }
        });
    });

    const id = `${entryId}:${address}:${asset}`;

    this.subscribers.get(id)?.stop();
    this.subscribers.set(id, subscriber);
  }
}
