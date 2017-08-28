/* @flow */
import 'isomorphic-fetch';
import log from 'electron-log';

const baseHeaders = {
    'Content-Type': 'application/json',
};

export default class JsonRpc {
    requestSeq: number;
    url: string;

    constructor(url: string) {
        this.requestSeq = 1;
        this.url = url;
    }

    /**
    * This call analyses JSON RPC response.
    * It returns promise which resolves whether 'result' field found
    * or reject in case 'error' field found.
    *
    * @returns {Promise}
    */
    call(name: string, params: any, headers: any) {
        return new Promise((resolve, reject) => {
            if (typeof name !== 'string') {
                reject(new Error(`RPC call method must be a string, got:
                    method: ${name},
                    params: ${JSON.stringify(params)},
                    headers: ${JSON.stringify(headers)}`));
                return;
            }
            this.post(name, params, headers).then((json) => {
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

    post(name: string, params: any, headers: any) {
        const data = this.newRequest(name, params);
        const opt = {
            method: 'POST',
            headers: Object.assign(baseHeaders, headers),
            body: JSON.stringify(data),
        };

        return fetch(this.url, opt).then((response) => {
            if (response.status >= 400) {
                throw new Error(`Bad RPC response: ${response.status}`);
            }
            try {
                return response.json();
            } catch (e) {
                log.error('Invalid JSON response', response, e);
                throw e;
            }
        });
    }

    newRequest(name: string, params: any) {
        return {
            jsonrpc: '2.0',
            method: name,
            params,
            id: this.requestSeq++,
        };
    }
}
