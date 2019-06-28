const { PricesListener } = require('@emeraldwallet/services');
const { ipcMain } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const log = require('./logger');

class Prices {
  constructor(webContents, apiAccess, from, currency) {
    this.webContents = webContents;
    this.froms = from;
    this.to = currency;
    this.apiAccess = apiAccess;
    ipcMain.on('prices/setCurrency', (event, to) => {
      to = to.toUpperCase();
      log.info('set prices', to);
      if (this.to !== to) {
        this.to = to;
        this.stop();
        this.start();
      }
      event.returnValue = 'ok';
    });
  }

  start() {
    this.stop();
    this.listener = this.apiAccess.newPricesListener();
    log.info(`Listen for prices, to ${this.to}`);
    const self = this;
    this.listener.subscribe(this.froms, this.to, (result) => {
      self.webContents.send('prices/rate', result);
    });
  }

  stop() {
    if (this.listener) {
      log.info('Closing prices listener');
      this.listener.close();
      this.listener = null;
    }
  }
}

module.exports = {
  Prices,
};
