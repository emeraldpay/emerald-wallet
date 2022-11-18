import { BlockchainCode, Logger, amountFactory } from '@emeraldwallet/core';
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
  private webContents?: WebContents;

  private subscribers: Map<string, AddressListener> = new Map();
  private subscriptions: Subscription[] = [];

  constructor(ipcMain: IpcMain, webContents: WebContents, apiAccess: EmeraldApiAccess) {
    this.id = 'BalanceIpcListener';

    this.apiAccess = apiAccess;
    this.ipcMain = ipcMain;
    this.webContents = webContents;
  }

  start(): void {
    this.ipcMain.on(
      'subscribe-balance',
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

  subscribeBalance(entry: Subscription): void {
    const subscriber = this.apiAccess.newAddressListener();

    const amountReader = amountFactory(entry.blockchain);

    subscriber.subscribe(entry.blockchain, entry.address, (event) => {
      try {
        this.webContents?.send('store', {
          type: 'ACCOUNT/SET_BALANCE',
          payload: {
            entryId: entry.entryId,
            value: amountReader(event.balance).encode(),
            utxo: event.utxo?.map((tx) => ({
              address: event.address,
              txid: tx.txid,
              value: amountReader(tx.value).encode(),
              vout: tx.vout,
            })),
          },
        });
      } catch (exception) {
        log.warn('Cannot send to the UI', exception);
      }
    });

    // can get multiple subscriptions for the same address, keep only last and cancel previous
    const id = `${entry.entryId}/${entry.address}`;

    this.subscribers.get(id)?.stop();
    this.subscribers.set(id, subscriber);
  }

  startSubscription(): void {
    this.subscriptions.forEach((entry) => this.subscribeBalance(entry));
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

  reconnect(): void {
    this.stop();
    this.start();
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

    const entry = { address, blockchain, entryId };

    this.subscriptions.push(entry);
    this.subscribeBalance(entry);
  }
}
