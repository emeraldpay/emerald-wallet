import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';
import { PersistentStateManager } from '@emeraldwallet/persistent-state';
import {
  AllowanceService,
  BalanceService,
  BlockchainStatusService,
  ConnectionStatusService,
  EmeraldApiAccess,
  PriceService,
  ServiceManager,
  TokenService,
  TransactionService,
} from '@emeraldwallet/services';
import { IpcMain, WebContents } from 'electron';
import { ApiMode } from './types';
import { Settings } from './index';

class Reconnect {
  private previousStatus = 'CONNECTED';
  private serviceManager: ServiceManager;

  constructor(serviceManager: ServiceManager) {
    this.serviceManager = serviceManager;
  }

  untilReconnect(): void {
    if (this.previousStatus === 'DISCONNECTED') {
      setTimeout(this.untilReconnect.bind(this), 5 * 1000);
    }

    this.serviceManager.reconnect();
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
): ServiceManager {
  const serviceManager = new ServiceManager();

  const priceService = new PriceService(ipcMain, apiAccess, persistentState, webContents);

  serviceManager.add(priceService);

  const balanceService = new BalanceService(ipcMain, apiAccess, settings, priceService, persistentState, webContents);

  serviceManager.add(balanceService);
  serviceManager.add(new AllowanceService(ipcMain, apiAccess, settings, persistentState, webContents, balanceService));
  serviceManager.add(new TokenService(ipcMain, apiAccess, settings, balanceService));
  serviceManager.add(new TransactionService(ipcMain, apiAccess, settings, persistentState, vault, webContents));

  for (const chain of apiMode.chains) {
    const blockchain = chain.toLowerCase() as BlockchainCode;

    serviceManager.add(new BlockchainStatusService(blockchain, apiAccess, webContents));
  }

  serviceManager.add(new ConnectionStatusService(ipcMain, apiAccess, webContents));

  const reconnect = new Reconnect(serviceManager);

  reconnect.start(apiAccess);

  return serviceManager;
}
