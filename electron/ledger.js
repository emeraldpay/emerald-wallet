const AppEth = require('@ledgerhq/hw-app-eth').default;
const Transport = require('@ledgerhq/hw-transport-node-hid').default;
const log = require('electron-log');

class LedgerApi {
  constructor() {
    this.appEth = null;
    this.transport = null;
    this.reqQueue = [];
    this.jobsQueueTimer = null;
  }

  runQueuedJobs() {
    if (this.reqQueue.length === 0) {
      this.jobsQueueTimer = setTimeout(() => this.runQueuedJobs(), 100);
      return Promise.resolve();
    }

    const jobsCopy = this.reqQueue.slice();
    this.reqQueue = []; // Empty the queue before async stuff to avoid race cond

    return jobsCopy
      .reduce((promiseChain, job) => promiseChain.then(job), Promise.resolve())
      .then(() => {
        this.jobsQueueTimer = setTimeout(() => this.runQueuedJobs(), 100);
      })
      .catch((e) => {
        this.jobsQueueTimer = setTimeout(() => this.runQueuedJobs(), 100);
      });
  }

  startQueue() {
    const isProcessingQueuedJobs = this.jobsQueueTimer !== null;
    const isAppEthCreated = this.appEth !== null;

    if (!isProcessingQueuedJobs && isAppEthCreated) {
      this.runQueuedJobs();
    }
  }

  connect() {
    if (this.appEth !== null) { return new Promise((resolve) => resolve(this)); }

    return Transport.create(500, 500).then((transport) => {
      this.transport = transport;
      this.appEth = new AppEth(transport);
      this.startQueue();
      return this;
    });
  }

  isConnected() {
    return this.appEth !== null;
  }

  disconnect() {
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
    return new Promise((resolve, reject) => {
      this.reqQueue.push(
        () => this.appEth.getAppConfiguration().then(resolve).catch(reject)
      );
    });
  }

  getAddress(hdpath) {
    return new Promise((resolve, reject) => {
      this.reqQueue.push(
        () => this.appEth.getAddress(hdpath).then(resolve).catch(reject)
      );
    });
  }
}

module.exports = {
  LedgerApi,
};
