const { AddressListener } = require('@emeraldwallet/services');
const { ipcMain } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies

class BalanceIpc {
  constructor(webContents) {
    this.webContents = webContents;
  }

  stop() {
    if (this.subscriber) {
      this.subscriber.stop();
    }
  }

  start(chain) {
    this.stop();
    const subscriber = new AddressListener(chain, 'localhost:8090');
    this.subscriber = subscriber;
    const {webContents} = this;
    ipcMain.on('subscribe-balance', (_, addresses) => {
      subscriber.stop();
      subscriber.subscribe(addresses, (event) => {
        webContents.send('store', 'ACCOUNT/SET_BALANCE', {accountId: event.address, value: event.balance});
      });
    });
  }
}

module.exports = {
  BalanceIpc,
};
