import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { IpcCommands, Logger, Versions } from '@emeraldwallet/core';
import { PersistentStateManager } from '@emeraldwallet/persistent-state';
import { ChainRpcConnections, EmeraldApiAccess, ServiceManager } from '@emeraldwallet/services';
import { WebContents, ipcMain } from 'electron';
import { createServices } from '../createServices';
import { ElectronLogger } from '../ElectronLogger';
import { ApiMode } from '../types';
import { setupApiIpc } from './ipc/application';
import { setupPersistentStateIpc } from './ipc/persistentState';
import { setupVaultIpc } from './ipc/vault';
import { Settings } from './Settings';

Logger.setInstance(new ElectronLogger());

export class Application {
  public log = Logger.forCategory('Application');

  public rpc: ChainRpcConnections;
  public settings: Settings;
  public versions: Versions;

  private serviceManager: ServiceManager | null | undefined;
  private webContents: WebContents | null | undefined;

  constructor(settings: Settings, versions: Versions) {
    this.rpc = new ChainRpcConnections();

    this.settings = settings;
    this.versions = versions;
  }

  public run(
    webContents: WebContents,
    apiAccess: EmeraldApiAccess,
    apiMode: ApiMode,
    persistentState: PersistentStateManager,
    vault: IEmeraldVault,
    rpc: ChainRpcConnections,
  ): void {
    this.rpc = rpc;
    this.webContents = webContents;

    this.log.info('Set IPC handlers');

    setupApiIpc(this, apiAccess);
    setupPersistentStateIpc(persistentState);
    setupVaultIpc(vault);

    this.log.info('Running services');

    this.serviceManager = createServices(
      this.settings,
      ipcMain,
      webContents,
      apiAccess,
      apiMode,
      persistentState,
      vault,
    );
    this.serviceManager.start();
  }

  public stop(): void {
    this.log.info('Stopping services');

    if (this.serviceManager != null) {
      this.serviceManager.stop();
      this.serviceManager = null;
    }
  }

  public showAbout(): void {
    this.webContents?.send(IpcCommands.STORE_DISPATCH, { type: 'SCREEN/DIALOG', name: 'about' });
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
    this.serviceManager?.setWebContents(webContents);
  }

  reconnect(reloaded = false): void {
    this.serviceManager?.reconnect(reloaded);
  }
}
