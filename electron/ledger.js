const AppEth = require("@ledgerhq/hw-app-eth").default;
const Transport = require("@ledgerhq/hw-transport-node-hid").default;
const log = require('electron-log');

require('es6-promise').polyfill();
class LedgerApi {
  constructor() {
    this.appEth = null;
    this.transport = null;
    this.reqQueue = [];
    this.jobsQueueTimer = null;
  }

  runQueuedJobs() {
    if (this.reqQueue.length === 0) {
      log.debug('nothing to do, check later');
      return this.jobsQueueTimer = setTimeout(() => this.runQueuedJobs(), 100);
    }

    const jobsCopy = this.reqQueue.slice();
    this.reqQueue = []; // Empty the queue before async stuff to avoid race cond

    log.debug('Processing jobs!', jobsCopy.length);
    return jobsCopy
      .reduce((promiseChain, job) => promiseChain.then(job), Promise.resolve())
      .then(() => {
        log.debug('all promises completed');
      })
      .catch((e) => {
        log.error(e);
      })
      .finally((e) => {
        this.jobsQueueTimer = setTimeout(() => this.runQueuedJobs(), 100);
      });
  }

  startQueue() {
    const isProcessingQueuedJobs = this.jobsQueueTimer !== null;
    const isAppEthCreated = this.appEth !== null;

    if (!isProcessingQueuedJobs && isAppEthCreated) {
      log.debug('no ledger job queue running yet... starting one.');
      this.runQueuedJobs();
    }
  }

  connect() {
    log.debug(`ledger connecting`);
    if (this.appEth !== null) { return new Promise((resolve) => resolve(this)); }
    log.debug('need to make a new connection');

    return Transport.create(500, 500).then(transport => {
      this.transport = transport;
      this.appEth = new AppEth(transport);
      log.debug('Ledger transport create completed.');
      this.startQueue();
      return this;
    });
  }

  isConnected() {
    return this.appEth !== null;
  }

  disconnect() {
    log.debug('disconnecting...');
    return new Promise((resolve, reject) => {
      this.reqQueue = [];

      if (this.appEth === null) { resolve(); }
      this.reqQueue.push(() => {
        this.appEth = null;

        return this.transport.close()
          .then((result) => {
            this.transport = null;
            resolve();
          })
          .catch(reject);
      });
    });
  }

  getStatus() {
    log.debug('fetching ledger status');
    return new Promise((resolve, reject) => {
      this.reqQueue.push(() => {
        log.debug('inside getstatus');
        return this.appEth.getAppConfiguration()
          .then((result) => {
            log.debug('get status success', result);
            return resolve(result);
          })
          .catch((e) => {
            log.error(e);
            reject(e);
          });
      });
    });
  }

  getAddress(hdpath) {
    log.debug('fetching address for path', hdpath);
    return new Promise((resolve, reject) => {
      this.reqQueue.push(() => {
        log.debug('processing get address call from queue');
        return this.appEth.getAddress(hdpath)
          .then(resolve)
          .catch(reject);
      });
    });
  }
}

module.exports = {
  LedgerApi,
};
