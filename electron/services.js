import log from 'loglevel';
import { LocalGeth, LocalConnector } from './launcher';
import { UserNotify } from './userNotify';
import { newGethDownloader } from './downloader';
import path from 'path';
import { app } from 'electron';


const STATUS = {
    NOT_STARTED: 0,
    STARTING: 1,
    STOPPING: 2,
    READY: 3,
    ERROR: 4,
};

const LAUNCH_TYPE = {
    LOCAL_RUN: 0,
    LOCAL_EXISTING: 1,
    REMOTE_URL: 2,
};

const DEFAULT_SETUP = {
    connectorType: LAUNCH_TYPE.LOCAL_RUN,
    rpcType: LAUNCH_TYPE.LOCAL_RUN,
    chain: 'morden',
    chainId: 62,
};

export class Services {

    constructor(webContents) {
        this.setup = Object.assign({}, DEFAULT_SETUP);
        this.connectorStatus = STATUS.NOT_STARTED;
        this.gethStatus = STATUS.NOT_STARTED;
        this.notify = new UserNotify(webContents);
    }

    start() {
        return Promise.all([
            this.startRpc(),
            this.startConnector()
        ]);
    }

    shutdown() {
        let shuttingDown = [];
        if (this.rpc) {
            shuttingDown.push(this.rpc.shutdown()
                .then(() => this.gethStatus = STATUS.NOT_STARTED)
                .then(() => this.notify.status("geth", "not ready")))
        }
        if (this.connnector) {
            shuttingDown.push(this.connector.shutdown()
                .then(() => this.connectorStatus = STATUS.NOT_STARTED)
                .then(() => this.notify.status("connector", "not ready")))
        }
        return Promise.all(shuttingDown);
    }

    startRpc() {
        return new Promise((resolve, reject) => {
            this.notify.status('geth', 'not ready');
            this.gethStatus = STATUS.NOT_STARTED;
            let gethDownloader = newGethDownloader(this.notify, getBinDir());
            gethDownloader.downloadIfNotExists().then(() => {
                this.notify.info('Launching Geth backend');
                this.gethStatus = STATUS.STARTING;
                let launcher = new LocalGeth(getBinDir(), this.setup.chain, 8545);
                this.rpc = launcher;
                launcher.launch().then((geth) => {
                    geth.stderr.on('data', (data) => {
                        if (/HTTP endpoint opened/.test(data)) {
                            this.gethStatus = STATUS.READY;
                            log.info("Geth is ready");
                            this.notify.info("Geth RPC API is ready");
                            this.notify.status("geth", "ready");
                            resolve(launcher)
                        }
                    });
                    geth.on('exit', (code) => {
                        this.gethStatus = STATUS.NOT_STARTED;
                        log.error('geth process exited with code ' + code);
                    });
                }).catch(reject);
            }).catch((err) => {
                log.error('Unable to download Geth', err);
                this.notify.info(`Unable to download Geth: ${err}`);
                reject(err);
            });
        });
    }

    startConnector() {
        return new Promise((resolve, reject) => {
            this.connectorStatus = STATUS.NOT_STARTED;
            this.notify.status("connector", "not ready");
            this.connector = new LocalConnector(getBinDir(), this.setup.chainId);
            this.connector.launch().then((emerald) => {
                this.connectorStatus = STATUS.STARTING;
                emerald.on('exit', (code) => {
                    this.connectorStatus = STATUS.NOT_STARTED;
                    log.error('Emerald Connector process exited with code ' + code);
                });
                emerald.stderr.on('data', (data) => {
                    if (/Connector started on/.test(data)) {
                        log.info("Connector is ready");
                        this.connectorStatus = STATUS.READY;
                        this.notify.status("connector", "ready");
                        resolve(this.connector);
                    }
                });
            }).catch(reject);
        });
    }

    notifyStatus() {
        return new Promise((resolve, reject) => {
            this.notify.status('connector', this.connectorStatus === STATUS.READY ? 'ready' : 'not ready');
            this.notify.status('geth', this.gethStatus === STATUS.READY ? 'ready' : 'not ready');
            this.notify.chain(
                this.setup.rpcType === LAUNCH_TYPE.LOCAL_RUN ? 'local' : 'remote',
                this.setup.chain,
                this.setup.chainId
            );
            resolve('ok');
        });
    }

}

function getBinDir() {
    const basedir = app.getPath("userData");
    return path.join(basedir, 'bin');
}
