const { app, protocol, webContents } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const log = require('../logger');

const getMainWebContents = () => webContents
  .getAllWebContents()
  .find((webcontent) => !!webcontent.browserWindowOptions);

function protocolHandler(event, url) {
  if (event) { event.preventDefault(); }

  const wc = getMainWebContents();
  if (!wc) {
    setTimeout(() => protocolHandler(null, url), 500);
    return;
  }

  wc.on('did-finish-load', () => wc.send('protocol', { url }));
}

function startProtocolHandler() {
  app.setAsDefaultProtocolClient('ethereum');

  app.on('will-finish-launching', () => {
    app.on('open-url', protocolHandler);
  });

  if (process.argv[1] && process.argv[1].includes('ethereum:')) {
    protocolHandler(null, process.argv[1]);
  }
}

module.exports = {
  startProtocolHandler,
  protocolHandler,
};
