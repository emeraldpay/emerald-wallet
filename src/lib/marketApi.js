import 'isomorphic-fetch';
import log from 'loglevel';

const url = 'https://coinmarketcap-nexuist.rhcloud.com/api/';

export class MarketApi {

    call(name = null, currency = 'etc') {
        return new Promise((resolve, reject) => {
            this.getRates(currency).then((json) => {
                if (json.price) {
                    resolve(json.price);
                } else {
                    reject(new Error(`Unknown JSON RPC response: ${json}`));
                }
            }).catch((error) => reject(error));
        });
    }

    getRates(curr) {
        return fetch(url + curr)
            .then((response) => response.json());
    }
}

/**
 * Creates rpc client instance or get
 * instance from Electron's main process
 */
function create() {
    if (typeof window.process !== 'undefined') {
        log.debug(`Electron: ${window.process.versions.electron}`);
        log.debug('Trying to get rpc api from Electron');
        // request rpc instance from Electron
        const remote = global.require('electron').remote;
        return remote.getGlobal('rpc');
    }
    return new MarketApi();
}
export const getRates = create();

export default getRates;
