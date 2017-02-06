import 'whatwg-fetch'

const url = "http://localhost:8545";
const headers = {
    'Content-Type': 'application/json'
};

let requestSeq = 1;

export function rpc(name, params) {
    const data = {
        "jsonrpc": "2.0",
        "method": name,
        "params": params,
        "id": requestSeq++
    };
    return fetch(url, {method: 'POST', headers: headers, body: JSON.stringify(data)})
        .then((response) => response.json())
}