const path = require('path'); // eslint-disable-line
const log = require('./logger');
const UserNotify = require('./userNotify').UserNotify; // eslint-disable-line
const {getBinDir, getLogDir} = require('./utils');
require('es6-promise').polyfill();

const SERVICES = {
  CONNECTOR: 'connector',
};

const STATUS = {
  NOT_STARTED: 0,
  STARTING: 1,
  STOPPING: 2,
  READY: 3,
  ERROR: 4,
  WRONG_SETTINGS: 5,
};

const LAUNCH_TYPE = {
  NONE: 0,
  LOCAL_RUN: 1,
  LOCAL_EXISTING: 2,
  REMOTE_URL: 3,
  AUTO: 4,
};

const DEFAULT_SETUP = {
  connector: {
    launchType: LAUNCH_TYPE.LOCAL_RUN,
    url: 'http://127.0.0.1:1920',
  },
};


class Services {
  constructor(webContents, serverConnect, apiAccess, dataDir) {
    this.setup = Object.assign({}, DEFAULT_SETUP);
    this.connectorStatus = STATUS.NOT_STARTED;
    this.notify = new UserNotify(webContents);
    this.serverConnect = serverConnect;
    this.dataDir = dataDir;

    log.info(`Run services from ${getBinDir()}`);
  }

  start() {
    return this.startConnector();
  }

  shutdown() {
    const shuttingDown = [];

    shuttingDown.push(this.shutdownRpc());

    if (this.connector) {
      shuttingDown.push(this.connector.shutdown()
        .then(() => { this.connectorStatus = STATUS.NOT_STARTED; })
        .then(() => this.notifyConnectorStatus()));
    }
    return Promise.all(shuttingDown);
  }

  shutdownRpc() {
    return this.serverConnect.disconnect();
  }

  startConnector() {
    return new Promise((resolve, reject) => {
      this.connectorStatus = STATUS.NOT_STARTED;
      this.notifyConnectorStatus();
    });
  }

  notifyStatus() {
    return new Promise((resolve, reject) => {
      this.notifyConnectorStatus(Services.statusName(this.connectorStatus));
      resolve('ok');
    });
  }

  static statusName(status) {
    switch (status) {
      case STATUS.READY: return 'ready';
      case STATUS.WRONG_SETTINGS: return 'wrong settings';
      case STATUS.NOT_STARTED: return 'not ready';
      default: return 'not ready';
    }
  }

  notifyConnectorStatus() {
    const connectorStatus = Services.statusName(this.connectorStatus);
    this.notify.status(SERVICES.CONNECTOR, {
      url: 'none',
      status: connectorStatus,
      version: this.setup.connector.version,
    });
  }
}

module.exports = {
  Services,
};
