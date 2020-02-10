import { Logger } from '@emeraldwallet/core';
import { Services } from '@emeraldwallet/services';
import { ipcMain } from 'electron';
import { createServices } from '../createServices';
import ElectronLogger from '../logging/ElectronLogger';

Logger.setInstance(new ElectronLogger());

export default class Application {
  public log = Logger.forCategory('application');
  private services: Services | null;

  constructor () {
    this.services = null;
  }

  public run (webContents: any, apiAccess: any, apiMode: any) {
    this.log.info('Running services');
    this.services = createServices(ipcMain, webContents, apiAccess, apiMode);
    this.services.start();
  }

  public stop () {
    this.log.info('Stopping services');
    if (this.services !== null) {
      this.services.stop();
      this.services = null;
    }
  }
}
