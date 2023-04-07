import {
  BlockchainCode,
  Blockchains,
  IpcCommands,
  Logger,
  amountFactory,
  blockchainCodeToId,
} from '@emeraldwallet/core';
import { PersistentStateManager } from '@emeraldwallet/persistent-state';
import { IpcMain, WebContents } from 'electron';
import { AddressListener } from './AddressListener';
import { EmeraldApiAccess } from '../..';
import { IService } from '../Services';

const log = Logger.forCategory('BalanceService');

interface Subscription {
  address: string;
  blockchain: BlockchainCode;
  entryId: string;
}

function isEqual(
  subscription: Subscription,
  address: string | string[],
  blockchain: BlockchainCode,
  entryId: string,
): boolean {
  return (
    subscription.entryId === entryId &&
    subscription.blockchain === blockchain &&
    typeof address === typeof subscription.address &&
    Object.is(subscription.address, address)
  );
}

export class BalanceListener implements IService {
  public id: string;

  private apiAccess: EmeraldApiAccess;
  private ipcMain: IpcMain;
  private persistentState: PersistentStateManager;
  private webContents?: WebContents;

  private subscribers: Map<string, AddressListener> = new Map();
  private subscriptions: Subscription[] = [];

  constructor(
    ipcMain: IpcMain,
    persistentState: PersistentStateManager,
    webContents: WebContents,
    apiAccess: EmeraldApiAccess,
  ) {
    this.id = 'BalanceIpcListener';

    this.apiAccess = apiAccess;
    this.ipcMain = ipcMain;
    this.persistentState = persistentState;
    this.webContents = webContents;
  }

  start(): void {
    this.ipcMain.on(
      IpcCommands.BALANCE_SUBSCRIBE,
      (event, blockchain: BlockchainCode, entryId: string, address: string | string[]) => {
        if (typeof address === 'string') {
          this.startInternal(blockchain, entryId, address);
        } else if (typeof address === 'object') {
          address.forEach((item) => this.startInternal(blockchain, entryId, item));
        }
      },
    );

    this.startSubscription();
  }

  stop(): void {
    this.subscribers.forEach((subscription) => subscription.stop());
    this.subscribers.clear();
  }

  reconnect(): void {
    this.stop();
    this.start();
  }

  subscribeBalance(subscription: Subscription): void {
    const subscriber = this.apiAccess.newAddressListener();

    const factory = amountFactory(subscription.blockchain);

    subscriber.subscribe(subscription.blockchain, subscription.address, (event) =>
      this.persistentState.balances
        .set({
          address: event.address,
          amount: event.balance,
          asset: Blockchains[subscription.blockchain].params.coin,
          blockchain: blockchainCodeToId(subscription.blockchain),
          utxo: event.utxo?.map(({ txid, vout, value: amount }) => ({ amount, txid, vout })),
        })
        .then(() =>
          this.webContents?.send(IpcCommands.STORE_DISPATCH, {
            type: 'ACCOUNT/SET_BALANCE',
            payload: {
              address: event.address,
              balance: factory(event.balance).encode(),
              entryId: subscription.entryId,
              utxo: event.utxo?.map((utxo) => ({
                address: event.address,
                txid: utxo.txid,
                value: factory(utxo.value).encode(),
                vout: utxo.vout,
              })),
            },
          }),
        ),
    );

    // can get multiple subscriptions for the same address, keep only last and cancel previous
    const id = `${subscription.entryId}/${subscription.address}`;

    this.subscribers.get(id)?.stop();
    this.subscribers.set(id, subscriber);
  }

  startSubscription(): void {
    this.subscriptions.forEach((subscription) => this.subscribeBalance(subscription));
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

  private isValidAddress(address: string | string[]): boolean {
    return (
      typeof address === 'string' ||
      (typeof address === 'object' && (address.length === 0 || typeof address[0] === 'string'))
    );
  }

  private startInternal(blockchain: BlockchainCode, entryId: string, address: string): void {
    if (!this.isValidAddress(address)) {
      log.warn('Request for invalid address', address);

      return;
    }

    this.subscriptions = this.subscriptions.filter(
      (subscription) => !isEqual(subscription, address, blockchain, entryId),
    );

    const subscription = { address, blockchain, entryId };

    this.subscriptions.push(subscription);
    this.subscribeBalance(subscription);
  }
}
