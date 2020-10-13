import {amountFactory, BlockchainCode, Logger} from '@emeraldwallet/core';
import {accounts} from '@emeraldwallet/store';
import {IService} from '../Services';
import {AddressListener} from './AddressListener';
import {WebContents} from 'electron';
import {EmeraldApiAccess} from "../..";

const log = Logger.forCategory('BalanceService');

interface Subscription {
  entryId: string,
  blockchain: BlockchainCode,
  address: string
}

function isEqual(curr: Subscription, blockchain: BlockchainCode, entryId: string, address: string | string[]) {
  return curr.entryId == entryId &&
    curr.blockchain == blockchain &&
    typeof address == typeof curr.address &&
    Object.is(curr.address, address)
}

export class BalanceListener implements IService {
  public id: string;
  private apiAccess: EmeraldApiAccess;
  private webContents?: WebContents;
  private ipcMain: any;
  private subscribers: Record<string, AddressListener>;
  private subscriptions: Subscription[];

  constructor(ipcMain: any, webContents: WebContents, apiAccess: EmeraldApiAccess) {
    this.ipcMain = ipcMain;
    this.webContents = webContents;
    this.apiAccess = apiAccess;
    this.id = `BalanceIpcListener`;
    this.subscribers = {};
    this.subscriptions = [];
  }

  public stop() {
    Object.keys(this.subscribers).forEach((s) => this.subscribers[s].stop());
    this.subscribers = {};
  }

  isValidAddress(address: string | string[]): boolean {
    return typeof address == "string" || (typeof address == "object" && (address.length == 0 || typeof address[0] == "string"));
  }

  public start() {
    this.ipcMain.on('subscribe-balance', (_: any, blockchain: BlockchainCode, entryId: string, address: string | string[]) => {
      if (typeof address == "string") {
        this.startInternal(blockchain, entryId, address);
      } else if (typeof address == "object") {
        address.forEach((it) => this.startInternal(blockchain, entryId, it))
      }
    });
    this.startSubscription();
  }

  startInternal(blockchain: BlockchainCode, entryId: string, address: string) {
    if (!this.isValidAddress(address)) {
      console.warn("Request for invalid address", address);
      return
    }
    this.subscriptions = this.subscriptions.filter((it) => !isEqual(it, blockchain, entryId, address));
    let entry = {
      entryId,
      blockchain,
      address
    };
    this.subscriptions.push(entry);
    this.subscribeBalance(entry);
  }

  public subscribeBalance(entry: Subscription) {
    const amountReader = amountFactory(entry.blockchain);
    const subscriber = this.apiAccess.newAddressListener();

    subscriber.subscribe(entry.blockchain, entry.address, undefined, (event) => {
      const action = accounts.actions.setBalanceAction({
        entryId: entry.entryId,
        value: amountReader(event.balance).encode(),
        utxo: event.utxo?.map((tx) => {
          return {
            txid: tx.txid,
            vout: tx.vout,
            value: amountReader(tx.value).encode(),
            address: event.address
          }
        })
      });

      try {
        this.webContents?.send('store', action);
      } catch (e) {
        log.warn("Cannot send to the UI", e)
      }
    });
    // can get multiple subscriptions for the same address, keep only last and cancel previous
    const id = `${entry.entryId}/${entry.address}`;
    this.subscribers[id]?.stop();
    this.subscribers[id] = subscriber;
  }

  public startSubscription() {
    this.subscriptions.forEach((entry) =>
      this.subscribeBalance(entry)
    );
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

  reconnect(): void {
    this.stop();
    this.start();
  }
}
