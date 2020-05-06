import { IVault, Logger } from '@emeraldwallet/core';
import { ChainRpcConnections, Services } from '@emeraldwallet/services';
import { ipcMain } from 'electron';
import { createServices } from '../createServices';
import ElectronLogger from '../logging/ElectronLogger';
import { setIpcHandlers } from './ipc-handlers/ipc';
import Settings from './Settings';

Logger.setInstance(new ElectronLogger());

export default class Application {
  public log = Logger.forCategory('application');
  public settings: Settings;
  public vault: IVault | null;
  public rpc: ChainRpcConnections;
  public versions: any;

  private services: Services | null;

  constructor (settings: Settings, versions?: any) {
    this.services = null;
    this.versions = versions;
    this.rpc = new ChainRpcConnections();
    this.vault = null;
    this.settings = settings;
  }

  public run (webContents: any, apiAccess: any, apiMode: any, vault: IVault, rpc: ChainRpcConnections) {
    this.rpc = rpc;
    this.vault = vault;
    this.log.info('Running services');
    this.services = createServices(ipcMain, webContents, apiAccess, apiMode);
    this.services.start();
    this.log.info('Set IPC handlers');
    setIpcHandlers(this);
  }

  public stop () {
    this.log.info('Stopping services');
    if (this.services !== null) {
      this.services.stop();
      this.services = null;
    }
  }
}
