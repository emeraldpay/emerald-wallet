import 'isomorphic-fetch';

const url = "http://localhost:1920";
const baseHeaders = {
  'Content-Type': 'application/json'
};

export class RpcApi {
  constructor() {
    this.requestSeq = 1;
  }

  call(name, params, headers) {
    return this.jsonPost(name, params, headers);
  }

  /**
   * This call analyses JSON RPC response.
   * It returns promise which resolves whether 'result' field found
   * or reject in case 'error' field found.
   *
   * @returns {Promise}
   */
  call2(name, params, headers) {
    return new Promise((resolve, reject) => {
      this.jsonPost(name, params, headers).then((json) => {
        if (json.result)
          resolve(json.result)
        else if (json.error)
          reject(json.error)
        else new Error(`Unknown JSON RPC response: ${json}`)
      }).catch(error => reject(error));
    });
  }

  jsonPost(name, params, headers) {
    const data = {
      'jsonrpc': '2.0',
      'method': name,
      'params': params,
      'id': this.requestSeq++
    }
    return fetch(url, {
      method: 'POST',
      headers: Object.assign(baseHeaders, headers),
      body: JSON.stringify(data)
    }).then(response => response.json())
  }
}


export default RpcApi;