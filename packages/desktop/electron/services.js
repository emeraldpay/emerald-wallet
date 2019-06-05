const { LocalConnector } = require('@emeraldwallet/vault');
const log = require('./logger');
const { NoneGeth, RemoteGeth } = require('./launcher');
const UserNotify = require('./userNotify').UserNotify; // eslint-disable-line
const {
  getBinDir, getLogDir, isValidChain, URL_FOR_CHAIN,
} = require('./utils');
require('es6-promise').polyfill();

const SERVICES = {
  CONNECTOR: 'connector',
  GETH: 'geth',
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
  geth: URL_FOR_CHAIN.mainnet,
  chain: null,
};


class Services {
  constructor(webContents, serverConnect, apiAccess) {
    this.setup = Object.assign({}, DEFAULT_SETUP);
    this.connectorStatus = STATUS.NOT_STARTED;
    this.gethStatus = STATUS.NOT_STARTED;
    this.notify = new UserNotify(webContents);
    this.emerald = serverConnect.connectEmerald();
    this.serverConnect = serverConnect;

    log.info(`Run services from ${getBinDir()}`);
  }

  /**
     * Configure services with new settings
     *
     * @param settings - plain JavaScript object with settings
     *
     */
  useSettings(settings) {
    if (isValidChain(settings.chain)) {
      const chainChanged = !this.setup.chain || this.setup.chain.name !== settings.chain.name;
      this.setup.chain = settings.chain;
      this.setup.geth = URL_FOR_CHAIN[settings.chain.name];
      log.debug('New Services setup', this.setup);
      this.gethStatus = STATUS.NOT_STARTED;
      if (chainChanged) {
        return this.shutdownRpc();
      }
    } else {
      this.gethStatus = STATUS.WRONG_SETTINGS;
    }
    return Promise.resolve(this.setup);
  }

  start() {
    const services = [];
    if (this.gethStatus === STATUS.NOT_STARTED) {
      services.push(this.startGeth());
    }
    if (this.connectorStatus === STATUS.NOT_STARTED) {
      services.push(this.startConnector());
    }
    return Promise.all(services);
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
    const shuttingDown = [];

    shuttingDown.push(
      this.serverConnect.disconnect()
        .then(() => { this.gethStatus = STATUS.NOT_STARTED; })
        .then(() => this.notifyEthRpcStatus())
    );
    return Promise.all(shuttingDown);
  }

  startNoneRpc() {
    this.notify.error('Ethereum connection type is not configured');
    return new NoneGeth();
  }

  startRemoteRpc() {
    log.info('use REMOTE RPC');
    this.gethStatus = STATUS.READY;
    this.notify.info(`Use Remote RPC API at ${this.setup.geth.url}`);
    this.notify.chain(this.setup.chain.name, this.setup.chain.id);
    this.notifyEthRpcStatus();
    return new RemoteGeth(null, null);
  }

  startGeth() {
    return new Promise((resolve, reject) => {
      this.gethStatus = STATUS.NOT_STARTED;
      this.notifyEthRpcStatus('not ready');

      if (this.setup.geth.launchType === LAUNCH_TYPE.NONE) {
        const geth = this.startNoneRpc();
        this.geth = geth;
        resolve(geth);
      } if (this.setup.geth.launchType === LAUNCH_TYPE.REMOTE_URL) {
        const geth = this.startRemoteRpc();
        this.geth = geth;
        resolve(geth);
      } else {
        reject(new Error(`Invalid Geth launch type ${this.setup.geth.launchType}`));
      }
    });
  }

  startConnector() {
    return new Promise((resolve, reject) => {
      this.connectorStatus = STATUS.NOT_STARTED;
      this.notifyConnectorStatus();

      this.connector = new LocalConnector(getBinDir(), log);

      const onVaultReady = () => {
        this.emerald.currentVersion().then((version) => {
          this.setup.connector.version = version;

          this.connectorStatus = STATUS.READY;
          this.notifyConnectorStatus();
          resolve(this.connector);
        });
      };

      return this.connector.launch().then((emerald) => {
        this.connectorStatus = STATUS.STARTING;

        emerald.on('exit', (code) => {
          if (!this.startedExternally) {
            this.connectorStatus = STATUS.NOT_STARTED;
            log.error(`Emerald Connector process exited with code: ${code}`);
            this.connector.proc = null;
          }
        });

        emerald.on('uncaughtException', (e) => {
          log.error((e && e.stack) ? e.stack : e);
        });

        const logTargetDir = getLogDir();
        log.debug('Emerald log target dir:', logTargetDir);

        emerald.stderr.on('data', (data) => {
          log.debug(`[emerald] ${data}`); // always log emerald data

          if (data.includes('KeyFile storage error')) {
            // connect to the one that already exists
            log.info('Got the error we wanted');
            this.startedExternally = true;
            return onVaultReady();
          }

          if (/Connector started on/.test(data)) {
            return onVaultReady();
          }
        });
      });
    });
  }

  notifyStatus() {
    return new Promise((resolve, reject) => {
      this.notifyConnectorStatus(Services.statusName(this.connectorStatus));
      this.notifyEthRpcStatus(Services.statusName(this.gethStatus));
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
      url: this.setup.connector.url,
      status: connectorStatus,
      version: this.setup.connector.version,
    });
  }

  notifyEthRpcStatus() {
    const gethStatus = Services.statusName(this.gethStatus);
    this.notify.status(SERVICES.GETH, {
      url: this.setup.geth.url,
      type: this.setup.geth.type,
      status: gethStatus,
      version: this.setup.geth.clientVersion,
    });
  }
}

module.exports = {
  Services,
};
