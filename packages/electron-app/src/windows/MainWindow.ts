import * as url from 'url';
import { Wallet } from '@emeraldpay/emerald-vault-core';
import { IEmeraldVault } from '@emeraldpay/emerald-vault-core/lib/vault';
import { IpcCommands } from '@emeraldwallet/core';
import { BrowserWindow, Menu, app as electronApp, ipcMain, shell } from 'electron';
import { ElectronLog } from 'electron-log';
import { Application } from '../application/Application';
import createMainMenu from './MainMenu';

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

  const { isDevelopMode } = options;

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

  window.loadURL(url.pathToFileURL(options.mainWndPath).toString()).catch(({ message }) => logger.error(message));

  app.setWebContents(window.webContents);

  const setupMainMenu = (): void => {
    vault.listWallets().then((wallets) => {
      const menuOptions: MenuOptions = {
        isDevelopMode,
        wallets: wallets.sort((first, second) => {
          if (first.createdAt === second.createdAt) {
            return 0;
          }

          return first.createdAt > second.createdAt ? 1 : -1;
        }),
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

  ipcMain.on(IpcCommands.UPDATE_MAIN_MENU, setupMainMenu);

  setupMainMenu();

  window.once('ready-to-show', () => {
    if (isDevelopMode) {
      window.webContents.openDevTools();
    }

    window?.show();
  });

  if (process.platform === 'darwin') {
    window.on('close', (event) => {
      event.preventDefault();

      electronApp.quit();
    });
  }

  window.on('closed', () => {
    mainWindow = null;
  });

  mainWindow = window;

  return window;
}
