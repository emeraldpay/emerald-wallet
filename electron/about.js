// Create the browser window.
const electron = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const path = require('path');
const url = require('url');

const createAboutPage = () => {
  const browserWindow = new electron.BrowserWindow({
    width: 700,
    height: 410,
    titleBarStyle: 'hidden',
    resizable: false,
    minimizable: false,
    maximizable: false,
    show: false,
  });
  browserWindow.setMenu(null);

  // and load the about.html.
  browserWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../app/about.html'),
    protocol: 'file:',
    slashes: true,
  }));

  browserWindow.once('ready-to-show', () => {
    browserWindow.show();
  });
};

module.exports = createAboutPage;
