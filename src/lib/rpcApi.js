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