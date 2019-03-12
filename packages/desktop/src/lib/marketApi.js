import 'isomorphic-fetch';

const url = (cur) => `https://min-api.cryptocompare.com/data/price?fsym=${cur}&extraParams=emerald&tsyms=USD,EUR,RUB,CNY,KRW,AUD`;
const currency = 'ETC';

export class MarketApi {
  call() {
    return new Promise((resolve, reject) => {
      this.getRates(currency).then((json) => {
        if (json) {
          resolve(json);
        } else {
          reject(new Error(`Unknown JSON RPC response: ${json}`));
        }
      }).catch((error) => reject(error));
    });
  }

  getRates(curr) {
    return fetch(url(curr))
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
