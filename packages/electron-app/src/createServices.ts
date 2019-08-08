import {
  Services, BlockchainStatus, BalanceListener, TransactionListener,
} from '@emeraldwallet/services';

export function createServices(ipcMain: any, webContents: any, apiAccess: any, chains: any): Services {
  const services = new Services();
  services.add(new BalanceListener(ipcMain, webContents, apiAccess));
  services.add(new TransactionListener(ipcMain, webContents, apiAccess));
  for (const chain of chains) {
    services.add(new BlockchainStatus(chain.toLowerCase(), webContents, apiAccess));
  }
  return services;
}
