import {exec, spawn} from 'child_process';
import fs from 'fs';
import os from 'os';
import log from 'loglevel';
import path from 'path';

const suffix = os.platform() === 'win32' ? '.exe' : '';

export class LocalGeth {
    constructor(bin, network, rpcPort) {
        this.bin = bin;
        this.network = network || 'morden';
        this.rpcPort = rpcPort || 8545;
    }

    launch() {
        return new Promise((resolve, reject) => {
            log.info(`Starting Geth... [network: ${this.network}, port: ${this.rpcPort}]`);
            const bin = path.join(this.bin, 'geth' + suffix);
            fs.access(bin, fs.constants.X_OK, (err) => {
                if (err) {
                    log.error(`File ${bin} doesn't exist or app doesn't have execution flag`);
                    reject(err)
                } else {
                    let options = [
                        '--chain', this.network,
                        '--rpc',
                        '--rpc-port', this.rpcPort,
                        '--rpc-cors-domain', 'http://localhost:8000',
                        '--cache=128',
                        '--fast', // (auto-disables when at or upon reaching current bc height)
                    ];
                    this.proc = spawn(bin, options);
                    resolve(this.proc)
                }
            });
        })
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

    constructor(bin, chainId) {
        this.bin = bin;
        this.chainId = chainId || '61';
    }

    launch() {
        return new Promise((resolve, reject) => {
            log.info(`Starting Emerald Connector... [chainId: ${this.chainId}]`);
            const bin = path.join(this.bin, 'emerald' + suffix);
            fs.access(bin, fs.constants.F_OK | fs.constants.R_OK | fs.constants.X_OK, (err) => {
                if (err) {
                    log.error(`File ${bin} doesn't exist or app doesn't have execution flag`);
                    reject(err)
                } else {
                    let options = [
                        'server',
                        '--verbose', 1,
                        '--chain-id', this.chainId
                    ];
                    this.proc = spawn(bin, options);
                    resolve(this.proc);
                }
            });
        })
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
