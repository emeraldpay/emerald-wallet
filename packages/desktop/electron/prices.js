const { settings } = require('@emeraldwallet/store');
const log = require('./logger');

class Prices {
  constructor(ipcMain, webContents, apiAccess, from, currency) {
    this.ipcMain = ipcMain;
    this.webContents = webContents;
    this.froms = from;
    this.to = currency;
    this.apiAccess = apiAccess;
    this.ipcMain.on('prices/setCurrency', (event, to) => {
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
    this.fetch();
  }

  fetch() {
    log.info(`Request for prices, to ${this.to}`);
    const self = this;
    this.listener.request(this.froms, this.to, (result) => {
      self.webContents.send('store', settings.actions.setRatesAction(result));
    });
    setTimeout(this.fetch.bind(this), 60000);
  }

  stop() {
    if (this.listener) {
      log.info('Closing prices listener');
      this.listener.stop();
      this.listener = null;
    }
  }
}

module.exports = {
  Prices,
};
