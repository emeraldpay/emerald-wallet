import * as url from 'url';
import { Wallet } from '@emeraldpay/emerald-vault-core';
import { IEmeraldVault } from '@emeraldpay/emerald-vault-core/lib/vault';
import { BrowserWindow, Menu, ipcMain, shell } from 'electron';
import { ElectronLog } from 'electron-log';
import createMainMenu from './MainMenu';
import Application from '../application/Application';

export interface MainWindowOptions {
  aboutWndPath: string;
  appIconPath: string;
  mainWndPath: string;
  isDevelopMode: boolean;
  logFile: string;
}

export interface MenuOptions {
  isDevelopMode: boolean;
  wallets: Wallet[];
  onAbout(): void;
  onOpenLog(): void;
}

let mainWindow: BrowserWindow | null;
let menu: Menu | null;

export function getMainWindow(
  app: Application,
  vault: IEmeraldVault,
  logger: ElectronLog,
  options: MainWindowOptions,
): BrowserWindow {
  if (mainWindow) {
    return mainWindow;
  }

  const window = new BrowserWindow({
    show: false,
    width: 1200,
    height: 720,
    minWidth: 1200,
    minHeight: 720,
    useContentSize: true,
    icon: options.appIconPath,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const { isDevelopMode } = options;

  const setupMainMenu = (): void => {
    vault.listWallets().then((wallets) => {
      const menuOptions: MenuOptions = {
        isDevelopMode,
        wallets,
        onAbout() {
          app.showAbout();
        },
        onOpenLog() {
          shell.openPath(options.logFile).catch(({ message }) => logger.error(message));
        },
      };

      menu = Menu.buildFromTemplate(createMainMenu(window, menuOptions));

      Menu.setApplicationMenu(menu);
      window.setMenu(menu);
    });
  };

  setupMainMenu();

  ipcMain.handle('vault/updateMainMenu', setupMainMenu);

  window
    .loadURL(
      url.format({
        pathname: options.mainWndPath,
        protocol: 'file:',
        slashes: true,
      }),
    )
    .catch(({ message }) => logger.error(message));

  app.setWebContents(window.webContents);

  if (isDevelopMode) {
    window.webContents.openDevTools();
  }

  window.on('closed', () => {
    mainWindow = null;
  });

  window.once('ready-to-show', () => {
    window?.show();
  });

  mainWindow = window;

  return window;
}
