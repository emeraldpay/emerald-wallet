import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { IpcCommands, Logger } from '@emeraldwallet/core';
import { PersistentStateImpl } from '@emeraldwallet/persistent-state';
import { ChainRpcConnections, EmeraldApiAccess, Services } from '@emeraldwallet/services';
import { WebContents, ipcMain } from 'electron';
import { setIpcHandlers } from './ipc-handlers/ipc';
import Settings from './Settings';
import { createServices } from '../createServices';
import ElectronLogger from '../logging/ElectronLogger';
import { ApiMode } from '../types';
import { mapVaultWithIpc } from '../vault/vaultIpc';

type Versions = Record<string, unknown>;

Logger.setInstance(new ElectronLogger());

export default class Application {
  public log = Logger.forCategory('Application');

  public rpc: ChainRpcConnections;
  public settings: Settings;
  public versions: Versions | undefined;

  private services: Services | null | undefined;
  private webContents: WebContents | null | undefined;

  constructor(settings: Settings, versions?: Versions) {
    this.rpc = new ChainRpcConnections();

    this.settings = settings;
    this.versions = versions;
  }

  public run(
    webContents: WebContents,
    apiAccess: EmeraldApiAccess,
    apiMode: ApiMode,
    persistentState: PersistentStateImpl,
    vault: IEmeraldVault,
    rpc: ChainRpcConnections,
  ): void {
    this.rpc = rpc;
    this.webContents = webContents;

    this.log.info('Set IPC handlers');

    setIpcHandlers(this, apiAccess, persistentState);

    mapVaultWithIpc(vault);

    this.log.info('Running services');

    this.services = createServices(this.settings, ipcMain, webContents, apiAccess, apiMode, persistentState, vault);
    this.services.start();
  }

  public stop(): void {
    this.log.info('Stopping services');

    if (this.services != null) {
      this.services.stop();
      this.services = null;
    }
  }

  public showAbout(): void {
    if (this.webContents != null) {
      this.webContents.send(IpcCommands.STORE_DISPATCH, { type: 'SCREEN/DIALOG', value: 'about' });
    }
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
    this.services?.setWebContents(webContents);
  }

  reconnect(reloaded = false): void {
    this.services?.reconnect(reloaded);
  }
}
