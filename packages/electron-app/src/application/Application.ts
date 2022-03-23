import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { Logger, WalletStateStorage } from '@emeraldwallet/core';
import { ChainRpcConnections, EmeraldApiAccess, Services } from '@emeraldwallet/services';
import { screen } from '@emeraldwallet/store';
import { ipcMain, WebContents } from 'electron';
import { createServices } from '../createServices';
import ElectronLogger from '../logging/ElectronLogger';
import { mapVaultWithIpc } from '../vault/vaultIpc';
import { mapWalletStateWithIpc } from '../walletstate/walletStateIpc';
import { setIpcHandlers } from './ipc-handlers/ipc';
import Settings from './Settings';

Logger.setInstance(new ElectronLogger());

export default class Application {
  public log = Logger.forCategory('application');
  public rpc: ChainRpcConnections;
  public settings: Settings;
  public versions: any;

  private services: Services | null;
  private webContents: any;

  constructor(settings: Settings, versions?: any) {
    this.rpc = new ChainRpcConnections();
    this.services = null;
    this.settings = settings;
    this.versions = versions;
  }

  public run(
    webContents: WebContents,
    apiAccess: EmeraldApiAccess,
    apiMode: any,
    vault: IEmeraldVault,
    rpc: ChainRpcConnections,
    walletStateStorage: WalletStateStorage,
  ): void {
    this.rpc = rpc;
    this.webContents = webContents;

    this.log.info('Running services');

    this.services = createServices(ipcMain, webContents, apiAccess, apiMode);
    this.services.start();

    this.log.info('Set IPC handlers');

    setIpcHandlers(this, apiAccess);

    mapVaultWithIpc(vault);
    mapWalletStateWithIpc(walletStateStorage);
  }

  public stop(): void {
    this.log.info('Stopping services');

    if (this.services !== null) {
      this.services.stop();
      this.services = null;
    }
  }

  public showAbout(): void {
    if (this.webContents != null) {
      try {
        this.webContents.send('store', screen.actions.showDialog('about'));
      } catch (exception) {
        this.log.error(exception);
      }
    }
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
    this.services?.setWebContents(webContents);
  }

  reconnect(): void {
    this.services?.reconnect();
  }
}
