import { BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { MenuOptions } from './MainWindow';

export default function (window: BrowserWindow, options: MenuOptions): MenuItemConstructorOptions[] {
  const darwinPlatform = process.platform === 'darwin';
  const controlButton = darwinPlatform ? 'Cmd' : 'Ctrl';

  let windowMenu: MenuItemConstructorOptions[] = [];

  if (darwinPlatform) {
    windowMenu = [
      {
        role: 'hide',
      },
      {
        role: 'hideOthers',
      },
      {
        role: 'unhide',
      },
      {
        type: 'separator',
      },
    ];
  }

  let walletsMenu: MenuItemConstructorOptions[] = [
    {
      label: 'No wallets created',
      enabled: false,
    },
  ];

  if (options.wallets.length > 0) {
    walletsMenu = options.wallets.map((wallet, index) => ({
      accelerator: index > 9 ? undefined : `${controlButton}+${index === 9 ? 0 : index + 1}`,
      label: wallet.name ?? `Wallet ${index + 1}`,
      click() {
        window.webContents.send('store', { type: 'SCREEN/OPEN', screen: 'wallet', item: wallet.id });
      },
    }));
  }

  let viewMenu: MenuItemConstructorOptions[] = [
    {
      role: 'resetZoom',
    },
    {
      role: 'zoomIn',
    },
    {
      role: 'zoomOut',
    },
    {
      type: 'separator',
    },
    {
      role: 'togglefullscreen',
    },
  ];

  if (options.isDevelopMode) {
    viewMenu = [
      {
        role: 'reload',
      },
      {
        role: 'toggleDevTools',
      },
      {
        type: 'separator',
      },
      ...viewMenu,
    ];
  }

  return [
    {
      label: '&Emerald',
      submenu: [
        ...windowMenu,
        {
          accelerator: `${controlButton}+Q`,
          role: 'quit',
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          role: 'undo',
        },
        {
          role: 'redo',
        },
        {
          type: 'separator',
        },
        {
          role: 'cut',
        },
        {
          role: 'copy',
        },
        {
          role: 'paste',
        },
        {
          role: 'delete',
        },
        {
          type: 'separator',
        },
        {
          role: 'selectAll',
        },
      ],
    },
    {
      label: '&View',
      submenu: viewMenu,
    },
    {
      label: '&Wallets',
      submenu: walletsMenu,
    },
    {
      label: '&Help',
      submenu: [
        {
          label: 'Open Logs',
          click() {
            options.onOpenLog();
          },
        },
        {
          type: 'separator',
        },
        {
          label: '&About',
          click() {
            options.onAbout();
          },
        },
      ],
    },
  ];
}
