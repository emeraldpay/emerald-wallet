export default class Emerald {
    constructor(jsonRpc) {
        this.rpc = jsonRpc;
    }

    listAccounts(chain) {
        this.notNull(chain, 'chain');
        return this.rpc.call('emerald_listAccounts', [{chain}]);
    }

    signTransaction(tx, chain) {
        this.notNull(chain, 'chain');
        return this.rpc.call('emerald_signTransaction', [tx, {chain}]);
    }

    importAccount(data, chain) {
        this.notNull(chain, 'chain');
        return this.rpc.call('emerald_importAccount', [data, {chain}]);
    }

    exportAccount(address, chain) {
        this.notNull(chain, 'chain');
        return this.rpc.call('emerald_exportAccount', [{address}, {chain}]);
    }

    updateAccount(address, name, description, chain) {
        this.notNull(chain, 'chain');
        return this.rpc.call('emerald_updateAccount', [{ name, description, address }, {chain}]);
    }

    newAccount(passphrase, name, description, chain) {
        this.notNull(chain, 'chain');
        const params = [{ passphrase, name, description }, {chain}];
        return this.rpc.call('emerald_newAccount', params);
    }

    call(params) {
        return this.rpc.call(params);
    }

    notNull(value, param) {
        if (!value) {
            throw new Error(`${param} must be not null`);
        }
    }
}
