const { app, protocol, webContents } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const log = require('../logger');

const getMainWebContents = () => webContents
  .getAllWebContents()
  .find((webcontent) => !!webcontent.browserWindowOptions);

function protocolHandler(event, url) {
  event.preventDefault();
  const wc = getMainWebContents();
  wc.send('protocol', { url });
}

function startProtocolHandler() {
  app.setAsDefaultProtocolClient('ethereum');
  app.on('will-finish-launching', () => {
    app.on('open-url', protocolHandler);
  });
}

module.exports = {
  startProtocolHandler,
};
