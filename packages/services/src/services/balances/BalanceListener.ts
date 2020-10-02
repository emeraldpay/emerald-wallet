import {amountFactory, BlockchainCode, IFrontApp, Logger} from '@emeraldwallet/core';
import {accounts} from '@emeraldwallet/store';
import {IService} from '../Services';
import {AddressListener} from './AddressListener';
import {WebContents} from 'electron';
import {EmeraldApiAccess} from "../..";

const log = Logger.forCategory('BalanceService');

interface Subscription {
  entryId: string,
  blockchain: BlockchainCode,
  address: string | string[]
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
      if (!this.isValidAddress(address)) {
        console.warn("Request for invalid address", address);
        return
      }
      this.subscriptions = this.subscriptions.filter((it) => it.entryId !== entryId);
      let entry = {
        entryId,
        blockchain,
        address
      };
      this.subscriptions.push(entry);
      this.subscribeBalance(entry);
    });
    this.startSubscription();
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

    this.subscribers[entry.entryId]?.stop();
    this.subscribers[entry.entryId] = subscriber;
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
