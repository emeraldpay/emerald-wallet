const { TxListener } = require('@emeraldwallet/services');
const { ipcMain } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies

class TransactionIpc {
  constructor(webContents, apiAccess) {
    this.webContents = webContents;
    this.apiAccess = apiAccess;
  }

  stop() {
    if (this.subscriber) {
      this.subscriber.stop();
    }
  }

  start(chain) {
    this.stop();
    const subscriber = this.apiAccess.newTxListener(chain);
    this.subscriber = subscriber;
    const {webContents} = this;
    ipcMain.on('subscribe-tx', (_, hash) => {
      subscriber.subscribe(hash, (event) => {
        // console.log("update for tx", hash);
        webContents.send('store',
          'WALLET/HISTORY/UPDATE_TXS',
          {
            transactions: [{
              hash: event.txid,
              blockNumber: event.blockNumber,
              timestamp: event.timestamp,
            }],
          });
      });
    });
  }
}

module.exports = {
  TransactionIpc,
};
