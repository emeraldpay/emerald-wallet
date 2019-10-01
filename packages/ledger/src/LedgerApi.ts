const AppEth = require('@ledgerhq/hw-app-eth').default;
const Transport = require('@ledgerhq/hw-transport-node-hid').default;

export class LedgerApi {
  private appEth: any;
  private transport: any;
  private reqQueue: any[];
  private jobsQueueTimer: any;

  constructor () {
    this.appEth = null;
    this.transport = null;
    this.reqQueue = [];
    this.jobsQueueTimer = null;
  }

  public runQueuedJobs (): Promise<void> {
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
      .catch((e: any) => {
        this.jobsQueueTimer = setTimeout(() => this.runQueuedJobs(), 100);
      });
  }

  public startQueue () {
    const isProcessingQueuedJobs = this.jobsQueueTimer !== null;
    const isAppEthCreated = this.appEth !== null;

    if (!isProcessingQueuedJobs && isAppEthCreated) {
      this.runQueuedJobs();
    }
  }

  public connect (): Promise<LedgerApi> {
    if (this.appEth !== null) {
      return new Promise((resolve) => resolve(this));
    }

    return Transport.create().then((transport: any) => {
      this.transport = transport;
      this.appEth = new AppEth(transport);
      this.startQueue();
      return this;
    });
  }

  public isConnected (): boolean {
    return this.appEth !== null;
  }

  public disconnect () {
    return new Promise((resolve, reject) => {
      this.reqQueue = [];

      if (this.appEth === null) {
        resolve();
      }
      this.reqQueue.push(() => {
        this.appEth = null;

        return this.transport.close()
          .then((result: any) => {
            this.transport = null;
            resolve();
          })
          .catch(reject);
      });
    });
  }

  public getStatus () {
    return new Promise((resolve, reject) => {
      this.reqQueue.push(
        () => this.appEth.getAppConfiguration().then(resolve).catch(reject)
      );
    });
  }

  public getAddress (hdpath: string) {
    return new Promise((resolve, reject) => {
      this.reqQueue.push(
        () => this.appEth.getAddress(hdpath).then(resolve).catch(reject)
      );
    });
  }
}
