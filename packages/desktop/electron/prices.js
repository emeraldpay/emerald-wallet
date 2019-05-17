const { PricesClient, GetRateRequest, credentials } = require('@emeraldplatform/grpc'); // eslint-disable-line import/no-unresolved
const { ipcMain } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const log = require('./logger');

class Prices {
  constructor(webContents) {
    this.webContents = webContents;
    this.froms = ['ETC', 'ETH', 'MORDEN'];
    this.to = 'USD';
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
    const cred = credentials.createInsecure();
    try {
      this.client = new PricesClient('localhost:8090', cred);
    } catch (e) {
      log.error('Unable to connect', e);
      return;
    }
    const req = new GetRateRequest();
    this.froms.forEach((from) => req.addFrom(from));
    req.setTo(this.to);
    log.info(`Listen for prices, to ${this.to}`);
    const self = this;
    this.client.streamRates(req, (stream) => {
      stream.on('data', (data) => {
        try {
          const result = {};
          data.getItemsList().forEach((item) => {
            if (item.getTo() === self.to && self.froms.indexOf(item.getFrom()) >= 0) {
              result[item.getFrom()] = item.getRate();
            }
          });
          self.webContents.send('prices/rate', result);
        } catch (e) {
          log.warn('Failed to send prices', e);
        }
      });
    });
  }

  stop() {
    if (this.client) {
      log.info('Closing prices listener');
      this.client.close();
      this.client = null;
    }
  }
}

module.exports = {
  Prices,
};
