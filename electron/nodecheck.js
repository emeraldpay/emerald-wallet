import 'isomorphic-fetch';
import log from 'electron-log';

const DefaultStatus = {
    url: null,
    exists: false,
    chain: null,
    chainId: null
};

function rpc(url, method, params) {
    const data = {
        jsonrpc: '2.0',
        id: 1,
        method, params,
    };
    return new Promise((resolve, reject) =>
        fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        }).then((response) => {
            try {
                response.json().then((json) => resolve(json.result)).catch(reject);
            } catch (e) {
                log.error("Invalid response", response, e);
                reject(e)
            }
        }).catch(reject)
    )
}

function exists(status) {
    return new Promise((resolve, reject) => {
        rpc(status.url, "web3_clientVersion", []).then((result) => {
            log.debug(`Found an RPC at ${status.url}`);
            resolve(Object.assign({}, status, {exists: true}))
        }).catch(() => {
            log.debug(`Can't find RPC at ${status.url}`);
            reject(`Can't find RPC at ${status.url}`)
        })
    });
}

function getChain(status) {
    return new Promise((resolve, reject) => {
        if (!status.exists) {
            resolve(status);
            return
        }
        rpc(status.url, "eth_getBlockByNumber", ["0x0", false]).then((result) => {
            if (result.hash === "0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3") {
                resolve(Object.assign({}, status, {chain: "mainnet", chainId: 61}))
            } else if(result.hash === '0x0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303') {
                resolve(Object.assign({}, status, {chain: "morden", chainId: 62}))
            } else {
                reject(new Error(`Unknown chain ${result.hash}`))
            }
        }).catch(() => {
            resolve(Object.assign({}, status, {exists: false}))
        })
    });
}

export function check(url) {
    let status = Object.assign({}, DefaultStatus, {url: url});
    return exists(status)
        .then(getChain)
}

export function waitRpc(url) {
    let status = Object.assign({}, DefaultStatus, {url: url});
    return new Promise((resolve, reject) => {
        let retry = (n) => {
            exists(status).then(resolve).catch(() => {
                if (n > 0) {
                    setTimeout(() => retry(n - 1), 1000);
                } else {
                    reject(new Error("Not Connected"))
                }
            })
        };
        retry(30);
    });
}