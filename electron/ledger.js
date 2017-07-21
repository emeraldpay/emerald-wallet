import LedgerComm from 'ledgerco/src/ledger-comm-node';
import LedgerEth from 'ledgerco/src/ledger-eth';
import log from 'electron-log';

export class LedgerApi {

    connect() {
        return new Promise((resolve, reject) => {
            if (this.conn !== null) {
                resolve(this)
            } else {
                LedgerComm.create_async(5000, false).then((conn) => {
                    log.info("Connected to Ledger");
                    this.conn = new LedgerEth(conn);
                    resolve(this);
                }).catch((err) => {
                    log.warn("Failed to connect to Ledger", err.message);
                    reject(err);
                });
            }
        });
    }

    isConnected() {
        return this.conn !== null;
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            if (this.conn) {
                this.conn.comm.close_async();
            }
            this.conn = null;
            resolve({})
        })
    }

    getStatus() {
        return new Promise((resolve, reject) => {
            this.conn.getAppConfiguration_async().then(resolve).fail(reject);
        })
    }

    getAddress(hdpath) {
        return new Promise((resolve, reject) => {
            this.conn.getAddress_async(hdpath).then(resolve).fail(reject);
        })
    }
}