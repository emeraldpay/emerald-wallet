import {BlockchainCode, IFrontApp, Logger} from '@emeraldwallet/core';
import {accounts} from '@emeraldwallet/store';
import {IService} from '../Services';
import {AddressListener} from './AddressListener';
import {WebContents} from 'electron';
import {EmeraldApiAccess} from "../..";
import {isBitcoin, isEthereum} from "@emeraldwallet/core";
import {Satoshi, Wei} from "@emeraldpay/bigamount-crypto";

const log = Logger.forCategory('BalanceService');

export class BalanceListener implements IService {
  public id: string;
  private apiAccess: EmeraldApiAccess;
  private webContents?: WebContents;
  private ipcMain: any;
  private subscribers: AddressListener[];
  private addresses: Partial<Record<BlockchainCode, string[]>> = {};

  constructor(ipcMain: any, webContents: WebContents, apiAccess: EmeraldApiAccess) {
    this.ipcMain = ipcMain;
    this.webContents = webContents;
    this.apiAccess = apiAccess;
    this.id = `BalanceIpcListener`;
    this.subscribers = [];
  }

  public stop() {
    this.subscribers.forEach((s) => s.stop());
    this.subscribers = [];
  }

  public start() {
    this.ipcMain.on('subscribe-balance', (_: any, blockchain: BlockchainCode, addresses: string[]) => {
      const current = this.addresses[blockchain] || [];
      addresses.forEach((address) => {
        if (current.indexOf(address) < 0) {
          current.push(address);
        }
      });
      this.addresses[blockchain] = current;
      this.startSubscription();
    });
    this.startSubscription();
  }

  public startSubscription() {
    // cancel current connections
    this.subscribers.forEach((s) => s.stop());
    this.subscribers = [];

    Object.keys(this.addresses).forEach((it) => {
      let blockchain: BlockchainCode = it as BlockchainCode
      const addresses = this.addresses[blockchain as BlockchainCode] || [];
      const subscriber = this.apiAccess.newAddressListener();

      subscriber.subscribe(blockchain, addresses, (event: any) => {
        log.debug(JSON.stringify(event));
        let amount;
        if (isBitcoin(blockchain)) {
          amount = new Satoshi(event.balance);
        } else if (isEthereum(blockchain)) {
          amount = new Wei(event.balance);
        } else {
          log.error("Unknown blockchain: " + blockchain)
          return
        }
        const action = accounts.actions.setBalanceAction({
          blockchain: blockchain as BlockchainCode,
          address: event.address,
          value: amount.encode(),
        });
        try {
          this.webContents?.send('store', action);
        } catch (e) {
          log.warn("Cannot send to the UI", e)
        }
      });
      this.subscribers.push(subscriber);
    })
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

  reconnect(): void {
    this.stop();
    this.start();
  }
}
