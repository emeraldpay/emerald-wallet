import {
  BalanceListener, BlockchainStatus, ConnStatus, PricesService, Services, TransactionListener
} from '@emeraldwallet/services';
import { IpcMain } from 'electron';

export function createServices (ipcMain: IpcMain, webContents: any, apiAccess: any, apiMode: any): Services {
  const services = new Services();
  services.add(new ConnStatus(ipcMain, webContents, apiAccess));
  services.add(new BalanceListener(ipcMain, webContents, apiAccess));
  services.add(new TransactionListener(ipcMain, webContents, apiAccess));
  for (const chain of apiMode.chains) {
    services.add(new BlockchainStatus(chain.toLowerCase(), webContents, apiAccess));
  }
  services.add(new PricesService(ipcMain, webContents, apiAccess, apiMode.assets, apiMode.currencies[0]));
  return services;
}
