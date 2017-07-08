import {exec, spawn} from 'child_process';
import fs from 'fs';
import os from 'os';
import log from 'electron-log';
import path from 'path';
import { getLogDir } from './services';

const suffix = os.platform() === 'win32' ? '.exe' : '';

export function checkExists(target) {
    return new Promise((resolve) => {
        fs.access(target, fs.constants.R_OK | fs.constants.X_OK, (err) => {
            if (err) {
                resolve(false);
            } else {
                fs.stat(target, (e, stat) => {
                    if (e) {
                        resolve(false);
                    } else if (!stat.isFile() || stat.size === 0) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            }
        });
    });
}

export class LocalGeth {
    constructor(bin, network, rpcPort) {
        this.bin = bin;
        this.network = network || 'morden';
        this.rpcPort = rpcPort || 8545;
    }

    launch() {
        return new Promise((resolve, reject) => {
            log.info(`Starting Geth... [network: ${this.network}, port: ${this.rpcPort}]`);
            const bin = path.join(this.bin, `geth${suffix}`);
            fs.access(bin, fs.constants.X_OK, (err) => {
                if (err) {
                    log.error(`File ${bin} doesn't exist or app doesn't have execution flag`);
                    reject(err);
                } else {
                    const logTarget = path.join(getLogDir(), 'geth'); // this shall be a dir
                    const options = [
                        '--chain', this.network,
                        '--rpc',
                        '--rpc-port', this.rpcPort,
                        '--rpc-cors-domain', 'http://localhost:8000',
                        '--cache=128',
                        '--fast', // (auto-disables when at or upon reaching current bc height)
                        '--log-dir', logTarget,
                    ];
                    this.proc = spawn(bin, options);
                    resolve(this.proc);
                }
            });
        });
    }

    shutdown() {
        log.info('Shutting down Local Geth');
        return new Promise((resolve, reject) => {
            if (!this.proc) {
                resolve('not_started');
                return;
            }
            this.proc.on('exit', () => {
                resolve('killed');
                this.proc = null;
            });
            this.proc.on('error', (err) => {
                log.error('Failed to shutdown Local Geth', err);
                reject(err);
            });
            this.proc.kill();
        });
    }

    getHost() {
        return '127.0.0.1';
    }

    getPort() {
        return this.rpcPort;
    }

    getUrl() {
        return `http://127.0.0.1:${this.rpcPort}`
    }
}

export class RemoteGeth {
    constructor(host, port) {
        this.host = host;
        this.port = port;
    }

    getHost() {
        return this.host;
    }

    getPort() {
        return this.port;
    }
}

export class NoneGeth {

}

export class LocalConnector {

    constructor(bin, chain) {
        this.bin = bin;
        this.chain = chain || 'mainnet';
    }

    // It would be nice to refactor so we can reuse functions
    // - chmod to executable
    // - check if exists
    // - move
    // - get bin path for executable (eg this.emeraldBin?)
    //
    // This will migrate from cargo bin path emerald to project dir if emerald
    // is already installed to the cargo bin path and does not exist in the project "bin" path,
    // which is the project base dir.
    migrateIfNotExists() {
        return new Promise((resolve, reject) => {
            const bin = path.join(this.bin, `emerald${suffix}`);
            log.debug('Checking if emerald exists:', bin);
            checkExists(bin).then((exists) => {
                if (!exists) {
                    log.debug('emerald not found');
                    // check that included binary path exists
                    // if it does exist, move it to this.bin/
                    const cargoEmeraldPath = path.join(process.env.HOME, '.cargo', 'bin', 'emerald');
                    log.debug('cargo installed emerald path:', cargoEmeraldPath);
                    checkExists(cargoEmeraldPath).then((emBinaryExists) => {
                        log.debug('cargo installed emerald path exists:', emBinaryExists);
                        if (!emBinaryExists) {
                            reject(new Error('No packaged emerald binary found.'));
                        }
                        const rs = fs.createReadStream(cargoEmeraldPath);
                        const ws = fs.createWriteStream(bin);
                        rs.on('error', (err) => { reject(err); });
                        ws.on('error', (err) => { reject(err); });
                        ws.on('close', () => {
                            fs.chmod(bin, 0o755, (moderr) => {
                                if (moderr) {
                                    log.error('Failed to set emerald executable flag', moderr);
                                    reject(moderr);
                                }
                                resolve(true);
                            });
                        });
                        rs.pipe(ws);
                    });
                } else {
                    // Assuming the emerald found is valid (perms, etc).
                    log.debug('OK: emerald exists: ', bin);
                    resolve(true);
                }
            });
        });
    }

    start() {
        return new Promise((resolve, reject) => {
            const bin = path.join(this.bin, `emerald${suffix}`);
            fs.access(bin, fs.constants.F_OK | fs.constants.R_OK | fs.constants.X_OK, (err) => {
                if (err) {
                    log.error(`File ${bin} doesn't exist or app doesn't have execution flag`);
                    reject(err);
                } else {
                    const options = [
                        'server',
                        '--chain', this.chain
                    ];
                    this.proc = spawn(bin, options);
                    resolve(this.proc);
                }
            });
        });
    }

    launch() {
        return new Promise((resolve, reject) => {
            log.info(`Starting Emerald Connector... [chain: ${this.chain}]`);
            this.migrateIfNotExists()
                    .then(this.start.bind(this))
                    .then(resolve)
                    .catch(reject);
        });
    }

    shutdown() {
        log.info('Shutting down Local Connector');
        return new Promise((resolve, reject) => {
            if (!this.proc) {
                resolve('not_started');
                return;
            }
            this.proc.on('exit', () => {
                resolve('killed');
                this.proc = null;
            });
            this.proc.on('error', (err) => {
                log.error('Failed to shutdown Emerald Connector', err);
                reject(err);
            });
            this.proc.kill();
        });
    }
}
