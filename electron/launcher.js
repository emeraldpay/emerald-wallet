import {exec, spawn} from 'child_process';
import os from 'os';
import log from 'loglevel';

const suffix = os.platform() === 'win32' ? '.exe' : '';

export function launchGeth() {
    log.info("Starting Geth...");
    const bin = './bin/geth' + suffix;
    let options = [
        '--chain', 'morden',
        '--rpc',
        '--rpc-cors-domain', 'http://localhost:8000'
    ];
    return spawn(bin, options);
}

export function launchEmerald() {
    log.info("Starting Emerald Connector...");
    const bin = './bin/emerald-cli' + suffix;
    let options = [
        '--client-host', '127.0.0.1',
        '--client-port', '8545'
    ];
    return spawn(bin, options);
}