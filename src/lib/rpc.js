import log from 'electron-log';
import RpcApi from './rpcApi';

export const rpc = create();

/**
 * Creates rpc client instance or get
 * instance from Electron's main process
 */
function create() {
    // if (typeof window.process !== 'undefined') {
    //     log.debug(`Electron: ${window.process.versions.electron}`);
    //     log.debug('Trying to get rpc api from Electron');
    //     // request rpc instance from Electron
    //     const remote = global.require('electron').remote;
    //     return remote.getGlobal('rpc');
    // }
    return new RpcApi();
}

export default rpc;
