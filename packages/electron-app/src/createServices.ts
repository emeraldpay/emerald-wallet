import {
  BalanceListener, BlockchainStatus, ConnStatus, Services, TransactionListener
} from '@emeraldwallet/services';
import { IpcMain } from 'electron';

export function createServices (ipcMain: IpcMain, webContents: any, apiAccess: any, chains: any): Services {
  const services = new Services();
  services.add(new ConnStatus(ipcMain, webContents, apiAccess));
  services.add(new BalanceListener(ipcMain, webContents, apiAccess));
  services.add(new TransactionListener(ipcMain, webContents, apiAccess));
  for (const chain of chains) {
    services.add(new BlockchainStatus(chain.toLowerCase(), webContents, apiAccess));
  }
  return services;
}
