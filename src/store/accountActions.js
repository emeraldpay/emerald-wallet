import Immutable from 'immutable';
import { rpc } from 'lib/rpc';
import { getRates } from 'lib/marketApi';
import { address } from 'lib/validators';
import { loadTokenBalanceOf } from './tokenActions';
import log from 'electron-log';
import { toHex, toNumber } from 'lib/convert';
import { gotoScreen, catchError } from './screenActions';

export function loadAccountBalance(accountId) {
    return (dispatch, getState) => {
        rpc.call('eth_getBalance', [accountId, 'latest']).then((result) => {
            dispatch({
                type: 'ACCOUNT/SET_BALANCE',
                accountId,
                value: result,
            });
        });
        // const tokens = getState().tokens;
        // if (!tokens.get('loading')) {
        //     tokens.get('tokens')
        //       .map((token) => dispatch(loadTokenBalanceOf(token, accountId)));
        // }
    };
}

export function loadAccountsList() {
    return (dispatch, getState) => {
        dispatch({
            type: 'ACCOUNT/LOADING',
        });
        let chain = getState().network.getIn(['chain', 'name']);
        rpc.call('emerald_listAccounts', [{chain}]).then((result) => {
            dispatch({
                type: 'ACCOUNT/SET_LIST',
                accounts: result,
            });
            result.map((acct) => dispatch(loadAccountBalance(acct.address))
            );
        });
    };
}

export function loadAccountTxCount(accountId) {
    return (dispatch) => {
        rpc.call('eth_getTransactionCount', [accountId, 'latest']).then((result) => {
            dispatch({
                type: 'ACCOUNT/SET_TXCOUNT',
                accountId,
                value: result,
            });
        });
    };
}

/*
 *
 * TODO: Error handling
*/
export function createAccount(passphrase, name, description) {
    return (dispatch, getState) => {
        let chain = getState().network.getIn(['chain', 'name']);
        rpc.call('emerald_newAccount', [{
            passphrase,
            name,
            description,
        }, {chain}]).then((result) => {
            dispatch({
                type: 'ACCOUNT/ADD_ACCOUNT',
                accountId: result,
                name,
                description,
            });
            dispatch(loadAccountBalance(result));
        });
    }
}

export function updateAccount(address, name, description) {
    return (dispatch, getState) => {
        let chain = getState().network.getIn(['chain', 'name']);
        rpc.call('emerald_updateAccount', [{
            name,
            description,
            address,
        }, {chain}]).then((result) => {
            dispatch({
                type: 'ACCOUNT/UPDATE_ACCOUNT',
                address,
                name,
                description,
            });
        });
    }
}

function sendRawTransaction(signed) {
    return rpc.call('eth_sendRawTransaction', [signed])
}

function unwrap(list) {
    return new Promise((resolve, reject) => {
        if (list.length === 1) {
            resolve(list[0])
        } else {
            reject(new Error(`Invalid list size ${list.length}`))
        }
    })
}

function onTxSend(dispatch, sourceTx) {
    return (txhash) => {
        dispatch({
            type: 'ACCOUNT/SEND_TRANSACTION',
            account: sourceTx.from,
            txHash: txhash,
        });
        dispatch(loadAccountBalance(sourceTx.from));
        const senttx = Object.assign({}, sourceTx, {hash: txhash});
        dispatch(trackTx(senttx));
        dispatch(gotoScreen('transaction', senttx));
    }
}


function getNonce(addr) {
    return rpc.call('eth_getTransactionCount', [addr, 'latest'])
}

function withNonce(tx) {
    return (nonce) => new Promise((resolve, reject) =>
        resolve(Object.assign({}, tx, {nonce}))
    )
}

function incNonce(nonce) {
    return new Promise((resolve) => {
        let nonceDec = toNumber(nonce);
        resolve(toHex(nonceDec + 1))
    })
}

function emeraldSign(txData, chain) {
    return rpc.call('emerald_signTransaction', [txData, {chain}])
}

export function sendTransaction(accountId, passphrase, to, gas, gasPrice, value) {
    let originalTx = {
        from: accountId,
        passphrase,
        to,
        gas,
        gasPrice,
        value,
    };
    return (dispatch, getState) => {
        let chain = getState().network.getIn(['chain', 'name']);
        getNonce(accountId)
            .then(incNonce)
            .then(withNonce(originalTx))
            .then((tx) =>
                emeraldSign(tx, chain)
                    .then(unwrap)
                    .then(sendRawTransaction)
                    .then(onTxSend(dispatch, tx))
                    .catch(catchError(dispatch))
            )
            .catch(catchError(dispatch));
    }
}

export function createContract(accountId, passphrase, gas, gasPrice, data) {
    let txData = {
        from: accountId,
        passphrase,
        gas,
        gasPrice,
        data,
    };
    return (dispatch, getState) => {
        let chain = getState().network.getIn(['chain', 'name']);
        rpc.call('emerald_signTransaction', [txData, {chain}])
            .then(unwrap)
            .then(sendRawTransaction)
            .then(onTxSend(dispatch, accountId))
            .catch(log.error);
    }
}

export function importWallet(wallet, name, description) {
    return (dispatch, getState) => {
        let chain = getState().network.getIn(['chain', 'name']);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsText(wallet);
            reader.onload = (event) => {
                let data;
                try {
                    data = JSON.parse(event.target.result);
                    data.filename = wallet.name;
                    data.name = name;
                    data.description = description;
                } catch (e) {
                    reject({error: e});
                }
                return rpc.call('emerald_importAccount', [data, {chain}]).then((result) => {
                    dispatch({
                        type: 'ACCOUNT/IMPORT_WALLET',
                        accountId: result,
                    });
                    // Reload accounts.
                    if (address(result) === undefined) {
                        dispatch({
                            type: 'ACCOUNT/ADD_ACCOUNT',
                            accountId: result,
                            name,
                            description,
                        });
                        dispatch(loadAccountBalance(result));
                        resolve(result);
                    } else {
                        reject({error: result});
                    }
                });
            };
        });
    };
}

function loadStoredTransactions() {
    return (dispatch) => {
        if (localStorage) {
            const storedTxs = localStorage.getItem('trackedTransactions');
            if (storedTxs !== null) {
                const storedTxsJSON = JSON.parse(storedTxs);
                dispatch({
                    type: 'ACCOUNT/LOAD_STORED_TXS',
                    transactions: storedTxsJSON,
                });
            }
        }
    };
}

export function loadPendingTransactions() {
    return (dispatch, getState) =>
        rpc.call('eth_getBlockByNumber', ['pending', true])
            .then((result) => {
                const addrs = getState().accounts.get('accounts')
                    .map((acc) => acc.get('id'));
                const txes = result.transactions.filter((t) =>
                    (addrs.includes(t.to) || addrs.includes(t.from))
                );
                dispatch({
                    type: 'ACCOUNT/PENDING_TX',
                    txList: txes,
                });
                dispatch(loadStoredTransactions());
                for (const tx of txes) {
                    const disp = {
                        type: 'ACCOUNT/PENDING_BALANCE',
                        value: tx.value,
                        gas: tx.gas,
                        gasPrice: tx.gasPrice,
                    };
                    if (addrs.includes(tx.from)) {
                        disp.from = tx.from;
                        dispatch(disp);
                    }
                    if (addrs.includes(tx.to)) {
                        disp.to = tx.to;
                        dispatch(disp);
                    }
                }
            });
}

export function refreshTransaction(hash) {
    return (dispatch) =>
        rpc.call('eth_getTransactionByHash', [hash]).then((result) => {
            if (typeof result === 'object') {
                dispatch({
                    type: 'ACCOUNT/UPDATE_TX',
                    tx: result,
                });
                /** TODO: Check for input data **/
                if ((result.creates !== undefined) && (address(result.creates) === undefined)) {
                    dispatch({
                        type: 'CONTRACT/UPDATE_CONTRACT',
                        tx: result,
                        address: result.creates,
                    });
                }
            }
        });
}

export function refreshTrackedTransactions() {
    return (dispatch, getState) => {
        getState().accounts.get('trackedTransactions').map(
            (tx) => dispatch(refreshTransaction(tx.get('hash')))
        );
    };
}

export function trackTx(tx) {
    return {
        type: 'ACCOUNT/TRACK_TX',
        tx,
    };
}

export function getGasPrice() {
    return (dispatch) => {
        rpc.call('eth_gasPrice', ['latest']).then((result) => {
            dispatch({
                type: 'ACCOUNT/GAS_PRICE',
                value: result,
            });
        });
    };
}

export function getExchangeRates() {
    return (dispatch) => {
        getRates.call().then((result) => {
            dispatch({
                type: 'ACCOUNT/EXCHANGE_RATES',
                rates: result,
            });
        });
    };
}
