import {exec, spawn} from 'child_process';
import os from 'os';
import log from 'loglevel';

const suffix = os.platform() === 'win32' ? '.exe' : '';

export class LocalGeth {
    constructor(network, rpcPort) {
        this.network = network || 'morden';
        this.rpcPort = rpcPort || 8545;
    }

    launch() {
        log.info("Starting Geth...");
        const bin = './bin/geth' + suffix;
        let options = [
            '--chain', this.network,
            '--rpc',
            '--rpc-port', this.rpcPort,
            '--rpc-cors-domain', 'http://localhost:8000'
        ];
        this.proc = spawn(bin, options);
        return this.proc;
    }

    shutdown() {
        log.info("Shutting down Local Geth")
    }
    
    getHost() {
        return '127.0.0.1'
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
        return this.host
    }

    getPort() {
        return this.port
    }
}

export class LocalConnector {

    constructor(target) {
        this.target = target;
    }

    launch() {
        log.info("Starting Emerald Connector...");
        const bin = './bin/emerald-cli' + suffix;
        let options = [
            '--client-host', this.target.getHost(),
            '--client-port', this.target.getPort()
        ];
        this.proc = spawn(bin, options);
        return this.proc
    }

    shutdown() {
        log.info("Shutting down Local Connector")
    }
}
