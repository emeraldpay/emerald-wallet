import {
  BalanceListener, BlockchainStatusService, ConnStatus, EmeraldApiAccess, PricesService, Services, TxService
} from '@emeraldwallet/services';
import {IpcMain} from 'electron';

class Reconnect {
  private services: Services;
  private previousStatus = "CONNECTED";

  constructor(services: Services) {
    this.services = services;
  }

  untilReconnect() {
    if (this.previousStatus === "DISCONNECTED") {
      setTimeout(this.untilReconnect.bind(this), 5000);
    }
    this.services.reconnect();
  }

  statusListener(status: string) {
    if (status === "DISCONNECTED" && status != this.previousStatus) {
      // needs to be set before reconnect
      this.previousStatus = status;
      this.untilReconnect();
    }
    this.previousStatus = status;
  }

  start(apiAccess: EmeraldApiAccess) {
    apiAccess.statusListener(this.statusListener.bind(this));
  }
}

export function createServices(ipcMain: IpcMain, webContents: any, apiAccess: EmeraldApiAccess, apiMode: any): Services {
  const services = new Services();
  services.add(new ConnStatus(ipcMain, webContents, apiAccess));
  services.add(new BalanceListener(ipcMain, webContents, apiAccess));
  services.add(new TxService(ipcMain, webContents, apiAccess));
  for (const chain of apiMode.chains) {
    services.add(new BlockchainStatusService(chain.toLowerCase(), webContents, apiAccess));
  }
  services.add(new PricesService(ipcMain, webContents, apiAccess, apiMode.assets, apiMode.currencies[0]));
  const reconnect = new Reconnect(services);
  reconnect.start(apiAccess);
  return services;
}
