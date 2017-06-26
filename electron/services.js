import log from 'loglevel';
import { LocalGeth, LocalConnector, NoneGeth, RemoteGeth } from './launcher';
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
    NONE: 0,
    LOCAL_RUN: 1,
    LOCAL_EXISTING: 2,
    REMOTE_URL: 3,
};

const DEFAULT_SETUP = {
    connectorType: LAUNCH_TYPE.LOCAL_RUN,
    rpcType: LAUNCH_TYPE.LOCAL_RUN,
    chain: 'morden',
    chainId: 62,
};

function rpcTypeName(type) {
    const names = ['none', 'local', 'local', 'remote'];
    return names[type]
}

export class Services {

    constructor(webContents) {
        this.setup = Object.assign({}, DEFAULT_SETUP);
        this.connectorStatus = STATUS.NOT_STARTED;
        this.gethStatus = STATUS.NOT_STARTED;
        this.notify = new UserNotify(webContents);
    }

    useSettings(settings) {
        return new Promise((resolve, reject) => {
            const rpcType = settings.get('rpcType');
            if (rpcType === 'none') {
                this.setup.rpcType = LAUNCH_TYPE.NONE;
            } else if (rpcType === 'remote' || rpcType === 'remote-auto') {
                this.setup.rpcType = LAUNCH_TYPE.REMOTE_URL;
                settings.set('chain', 'mainnet');
                settings.set('chainId', 61);
            } else if (rpcType === 'local') {
                this.setup.rpcType = LAUNCH_TYPE.LOCAL_RUN;
            } else {
                log.error("Invalid chain type: ", rpcType);
                this.setup.rpcType = LAUNCH_TYPE.NONE;
                reject(new Error(`Invalid chain type: ${rpcType}`));
                return
            }
            this.setup.chain = settings.get('chain');
            this.setup.chainId = settings.get('chainId');
            resolve(this.setup);
        })
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
        if (this.connector) {
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
            if (this.setup.rpcType === LAUNCH_TYPE.NONE) {
                log.info("use NONE Geth");
                this.notify.error("Ethereum connection type is not configured");
                resolve(new NoneGeth());
                return
            }
            if (this.setup.rpcType === LAUNCH_TYPE.REMOTE_URL) {
                log.info("use REMOTE Geth");
                this.gethStatus = STATUS.READY;
                this.notify.info("Use Remote RPC API");
                this.notify.rpcUrl('https://api.gastracker.io/web3');
                this.notify.status("geth", "ready");
                resolve(new RemoteGeth(null, null));
                return
            }
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
                rpcTypeName(this.setup.rpcType),
                this.setup.chain,
                this.setup.chainId
            );
            if (this.setup.rpcType === LAUNCH_TYPE.REMOTE_URL) {
                this.notify.rpcUrl('https://mewapi.epool.io');
            }
            resolve('ok');
        });
    }

}

function getBinDir() {
    const basedir = app.getPath("userData");
    return path.join(basedir, 'bin');
}
