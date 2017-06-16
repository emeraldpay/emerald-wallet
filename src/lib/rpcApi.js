import 'isomorphic-fetch';

const baseHeaders = {
    'Content-Type': 'application/json',
};

const emeraldMethods = [
    "eth_sendTransaction",
    "eth_accounts"
];

export class RpcApi {
    constructor(urlEmerald, urlGeth) {
        this.requestSeq = 1;
        this.urlEmerald = urlEmerald || 'http://localhost:1920';
        this.urlGeth = urlGeth || 'http://localhost:8545';
    }

    static routeToEmerald(method) {
        if (method.startsWith('emerald_') || method.startsWith('personal_') || method.startsWith('backend_')) {
            return true
        }
        return emeraldMethods.indexOf(method) >= 0
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
            this.jsonPost(name, params, headers).then((json) => {
                if (json.result) {
                    resolve(json.result);
                } else if (json.error) {
                    reject(json.error);
                } else {
                    reject(new Error(`Unknown JSON RPC response: ${json}`));
                }
            }).catch((error) => reject(error));
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
        }).then((response) => response.json());
    }
}


export default RpcApi;
