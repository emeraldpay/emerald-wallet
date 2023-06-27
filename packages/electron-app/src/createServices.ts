import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';
import { PersistentStateManager } from '@emeraldwallet/persistent-state';
import {
  BalanceListener,
  BlockchainStatusService,
  ConnectionStatus,
  EmeraldApiAccess,
  PricesService,
  Services,
  TokenService,
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
      setTimeout(this.untilReconnect.bind(this), 5 * 1000);
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

  const pricesService = new PricesService(ipcMain, apiAccess, persistentState, webContents);

  services.add(pricesService);

  const balanceListener = new BalanceListener(
    ipcMain,
    apiAccess,
    settings,
    pricesService,
    persistentState,
    webContents,
  );

  services.add(balanceListener);
  services.add(new TokenService(ipcMain, apiAccess, settings, balanceListener));
  services.add(new TxService(ipcMain, apiAccess, settings, persistentState, vault, webContents));

  for (const chain of apiMode.chains) {
    const blockchain = chain.toLowerCase() as BlockchainCode;

    services.add(new BlockchainStatusService(blockchain, apiAccess, webContents));
  }

  services.add(new ConnectionStatus(ipcMain, apiAccess, webContents));

  const reconnect = new Reconnect(services);

  reconnect.start(apiAccess);

  return services;
}
