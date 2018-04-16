// Create the browser window.
const electron = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const path = require('path');
const url = require('url');

const createAboutPage = () => {
  const mainWindow = new electron.BrowserWindow({ width: 800, height: 360, titleBarStyle: 'hidden', resizable: false });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../app/about.html'),
    protocol: 'file:',
    slashes: true,
  }));

  mainWindow.setMenu(null);
};

module.exports = createAboutPage;
