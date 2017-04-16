import 'whatwg-fetch';

const url = "http://localhost:1920";
const baseHeaders = {
    'Content-Type': 'application/json'
};

let requestSeq = 1;

export function rpc(name, params, headers) {
    const data = {
        "jsonrpc": "2.0",
        "method": name,
        "params": params,
        "id": requestSeq++
    };
    return fetch(url, {method: 'POST', headers: Object.assign(baseHeaders, headers), body: JSON.stringify(data)})
        .then((response) => response.json())
}