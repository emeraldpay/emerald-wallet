import {
  BalanceListener, BlockchainStatusService, ConnStatus, EmeraldApiAccess, PricesService, Services, TxService
} from '@emeraldwallet/services';
import { IpcMain } from 'electron';

export function createServices(ipcMain: IpcMain, webContents: any, apiAccess: EmeraldApiAccess, apiMode: any): Services {
  const services = new Services();
  services.add(new ConnStatus(ipcMain, webContents, apiAccess));
  services.add(new BalanceListener(ipcMain, webContents, apiAccess));
  services.add(new TxService(ipcMain, webContents, apiAccess));
  for (const chain of apiMode.chains) {
    services.add(new BlockchainStatusService(chain.toLowerCase(), webContents, apiAccess));
  }
  services.add(new PricesService(ipcMain, webContents, apiAccess, apiMode.assets, apiMode.currencies[0]));
  return services;
}
