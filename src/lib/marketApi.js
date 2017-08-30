import 'isomorphic-fetch';

const url = 'https://coinmarketcap-nexuist.rhcloud.com/api/';
const currency = 'etc';

export class MarketApi {

    call() {
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
    return new MarketApi();
}
export const getRates = create();

export default getRates;
