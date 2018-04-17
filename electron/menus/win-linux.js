const { shell } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const logger = require('../logger');
const createAboutPage = require('../about');

module.exports = function (window) {
  return [
    {
      label: '&Emerald',
      submenu: [
        {
          label: '&Close',
          accelerator: 'Ctrl+W',
          click: () => {
            window.close();
          },
        },
      ],
    },
    {
      label: '&View',
      submenu: [
        {
          label: '&Reload',
          accelerator: 'Ctrl+R',
          click: () => { window.webContents.reload(); },
        },
        {
          label: 'Toggle &Full Screen',
          accelerator: 'F11',
          click: () => { window.setFullScreen(!window.isFullScreen()); },
        },
        {
          label: 'Toggle &Developer Tools',
          accelerator: 'Alt+Ctrl+I',
          click: () => { window.toggleDevTools(); },
        },
        {
          label: 'Open Logs',
          click() {
            shell.openItem(logger.transports.file.file);
          },
        },
      ],
    },
    {
      label: '&Help',
      submenu: [
        {
          label: '&About',
          click() { createAboutPage(); },
        },
      ],
    },
  ];
};
