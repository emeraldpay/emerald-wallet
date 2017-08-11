export default class Geth {
    constructor(jsonRpc) {
        this.rpc = jsonRpc;
    }

    getBalance(address, blockNumber = 'latest') {
        return this.rpc.call('eth_getBalance', [address, blockNumber]);
    }

    gasPrice() {
        return this.rpc.call('eth_gasPrice', []);
    }

    getBlockByNumber(blockNumber = 'latest', full = false) {
        return this.rpc.call('eth_getBlockByNumber', [blockNumber, full]);
    }

    getTransactionCount(address) {
        return this.rpc.call('eth_getTransactionCount', [address, 'latest']);
    }

    sendRawTransaction(signed) {
        return this.rpc.call('eth_sendRawTransaction', [signed]);
    }

    getTransactionByHash(hash) {
        return this.rpc.call('eth_getTransactionByHash', [hash]);
    }

    call(method, params) {
        return this.rpc.call(method, params);
    }

}
