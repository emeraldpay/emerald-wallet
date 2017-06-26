import 'isomorphic-fetch';
import log from 'loglevel';

const baseHeaders = {
    'Content-Type': 'application/json',
};

export class RpcApi {
    constructor(urlEmerald, urlGeth) {
        this.requestSeq = 1;
        this.urlEmerald = urlEmerald || 'http://localhost:1920';
        this.urlGeth = urlGeth || 'http://localhost:8545';
    }

    static routeToEmerald(method) {
        if (typeof method !== 'string') {
            return false;
        }
        return method.startsWith('emerald_');
    }

    /**
    * This call analyses JSON RPC response.
    * It returns promise which resolves whether 'result' field found
    * or reject in case 'error' field found.
    *
    * @returns {Promise}
    */
    call(name, params, headers) {
        return new Promise((resolve, reject) => {
            if (typeof name !== 'string') {
                reject(new Error(`RPC call method must be a string, got:
                    method: ${name},
                    params: ${JSON.stringify(params)},
                    headers: ${JSON.stringify(headers)}`));
                return
            }
            this.jsonPost(name, params, headers).then((json) => {
                // eth_syncing will return {.. "result": false}
                if (json.result || json.result === false || json.result === null) {
                    resolve(json.result);
                } else if (json.error) {
                    reject(json.error);
                } else {
                    reject(new Error(`Unknown JSON RPC response: ${JSON.stringify(json)},
                     name: ${name},
                     params: ${JSON.stringify(params)}`));
                }
            }).catch(reject);
        });
    }

    jsonPost(name, params, headers) {
        const data = {
            jsonrpc: '2.0',
            method: name,
            params,
            id: this.requestSeq++,
        };
        const url = RpcApi.routeToEmerald(name) ? this.urlEmerald : this.urlGeth;
        return fetch(url, {
            method: 'POST',
            headers: Object.assign(baseHeaders, headers),
            body: JSON.stringify(data),
        }).then((response) => {
            try {
                return response.json()
            } catch (e) {
                log.error("Invalid response", response, e);
                throw e
            }
        });
    }
}


export default RpcApi;
