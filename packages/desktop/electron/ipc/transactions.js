const { TxListener } = require('@emeraldwallet/services');
const { ipcMain } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies

class TransactionIpc {
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
    const subscriber = new TxListener(chain, 'localhost:8090');
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
