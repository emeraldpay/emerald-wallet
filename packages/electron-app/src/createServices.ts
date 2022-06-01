import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';
import { PersistentStateImpl } from '@emeraldwallet/persistent-state';
import {
  BalanceListener,
  BlockchainStatusService,
  ConnStatus,
  EmeraldApiAccess,
  PricesService,
  Services,
  TxHistoryService,
  TxService,
} from '@emeraldwallet/services';
import { IpcMain, WebContents } from 'electron';
import { ApiMode } from './types';

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
  ipcMain: IpcMain,
  webContents: WebContents,
  apiAccess: EmeraldApiAccess,
  apiMode: ApiMode,
  persistentState: PersistentStateImpl,
  vault: IEmeraldVault,
): Services {
  const services = new Services();

  services.add(new BalanceListener(ipcMain, webContents, apiAccess));
  services.add(new ConnStatus(ipcMain, webContents, apiAccess));
  services.add(new TxService(ipcMain, webContents, apiAccess));
  services.add(new TxHistoryService(apiAccess, persistentState,vault, webContents));

  for (const chain of apiMode.chains) {
    const blockchain = chain.toLowerCase() as BlockchainCode;

    services.add(new BlockchainStatusService(blockchain, webContents, apiAccess));
  }

  services.add(new PricesService(ipcMain, webContents, apiAccess, apiMode.assets, apiMode.currencies[0]));

  const reconnect = new Reconnect(services);

  reconnect.start(apiAccess);

  return services;
}
