import {exec, spawn} from 'child_process';
import log from 'loglevel';

export function launchGeth() {
    log.info("Starting Geth...");
    const bin = './bin/geth';
    let options = [
        '--chain', 'morden',
        '--rpc',
        '--rpc-cors-domain', 'http://localhost:8000'
    ];
    return spawn(bin, options);
}

export function launchEmerald() {
    log.info("Starting Emerald Connector...");
    const bin = './bin/emerald-cli';
    let options = [
        '--client-host', '127.0.0.1',
        '--client-port', '8545'
    ];
    return spawn(bin, options);
}