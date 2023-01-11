import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';
import { PersistentStateManager } from '@emeraldwallet/persistent-state';
import {
  BalanceListener,
  BlockchainStatusService,
  ConnStatus,
  EmeraldApiAccess,
  PricesService,
  Services,
  TxService,
} from '@emeraldwallet/services';
import { IpcMain, WebContents } from 'electron';
import { ApiMode } from './types';
import { Settings } from './index';

class Reconnect {
  private previousStatus = 'CONNECTED';
  private services: Services;

  constructor(services: Services) {
    this.services = services;
  }

  untilReconnect(): void {
    if (this.previousStatus === 'DISCONNECTED') {
      setTimeout(this.untilReconnect.bind(this), 5000);
    }

    this.services.reconnect();
  }

  statusListener(status: string): void {
    if (status === 'DISCONNECTED' && status !== this.previousStatus) {
      this.previousStatus = status;
      this.untilReconnect();
    }

    this.previousStatus = status;
  }

  start(apiAccess: EmeraldApiAccess): void {
    apiAccess.statusListener(this.statusListener.bind(this));
  }
}

export function createServices(
  settings: Settings,
  ipcMain: IpcMain,
  webContents: WebContents,
  apiAccess: EmeraldApiAccess,
  apiMode: ApiMode,
  persistentState: PersistentStateManager,
  vault: IEmeraldVault,
): Services {
  const services = new Services();

  services.add(new BalanceListener(ipcMain, webContents, apiAccess));
  services.add(new ConnStatus(ipcMain, webContents, apiAccess));
  services.add(new TxService(apiAccess, persistentState, vault, ipcMain, webContents, settings));

  for (const chain of apiMode.chains) {
    const blockchain = chain.toLowerCase() as BlockchainCode;

    services.add(new BlockchainStatusService(blockchain, webContents, apiAccess));
  }

  services.add(new PricesService(apiAccess, ipcMain, webContents, apiMode.assets));

  const reconnect = new Reconnect(services);

  reconnect.start(apiAccess);

  return services;
}
