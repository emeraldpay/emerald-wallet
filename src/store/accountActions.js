import log from 'electron-log';
import EthereumTx from 'ethereumjs-tx';
import { convert } from 'emerald-js';
import { api } from '../lib/rpc/api';

import { getRates } from '../lib/marketApi';
import { address as isAddress} from '../lib/validators';
import { loadTokenBalanceOf } from './tokenActions';
import { gotoScreen, catchError } from './screenActions';
import Wallet from '../lib/wallet';

const { toNumber, toHex } = convert;
const currentChain = (state) => state.launcher.getIn(['chain', 'name']);

export function loadAccountBalance(accountId) {
    return (dispatch, getState) => {
        api.geth.getBalance(accountId).then((result) => {
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
        const chain = currentChain(getState());

        api.emerald.listAccounts(chain).then((result) => {
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
        api.geth.getTransactionCount(accountId).then((result) => {
            dispatch({
                type: 'ACCOUNT/SET_TXCOUNT',
                accountId,
                value: result,
            });
        });
    };
}

export function exportPaperWallet(passphrase, accountId) {
    return (dispatch, getState) => {
        const chain = currentChain(getState());
        api.emerald.exportAccount(accountId, chain).then((result) => {
            const wallet = Wallet.fromV3(result, passphrase);
            const privKey = wallet.getPrivateKeyString();
            dispatch(gotoScreen('paper-wallet', { address: accountId, privKey }));
        }).catch(catchError(dispatch));
    };
}

export function exportKeyFile(accountId) {
    return (dispatch, getState) => {
        const chain = currentChain(getState());
        return api.emerald.exportAccount(accountId, chain);
    };
}

export function createAccount(passphrase, name = '', description = '') {
    return (dispatch, getState) => {
        const chain = currentChain(getState());

        return api.emerald.newAccount(passphrase, name, description, chain)
            .then((result) => {
                log.debug(`Account ${result} created`);
                dispatch({
                    type: 'ACCOUNT/ADD_ACCOUNT',
                    accountId: result,
                    name,
                    description,
                });
                dispatch(loadAccountBalance(result));
                return result;
            }).catch(catchError(dispatch));
    };
}

export function updateAccount(address, name, description) {
    return (dispatch, getState) => {
        const chain = currentChain(getState());
        return api.emerald.updateAccount(address, name, description, chain)
            .then((result) => {
                dispatch({
                    type: 'ACCOUNT/UPDATE_ACCOUNT',
                    address,
                    name,
                    description,
                });
            });
    };
}

function sendRawTransaction(signed) {
    return api.geth.sendRawTransaction(signed);
}

function unwrap(list) {
    return new Promise((resolve, reject) => {
        if (list.length === 1) {
            resolve(list[0]);
        } else {
            reject(new Error(`Invalid list size ${list.length}`));
        }
    });
}

function onTxSend(dispatch, sourceTx) {
    return (txhash) => {
        dispatch({
            type: 'ACCOUNT/SEND_TRANSACTION',
            account: sourceTx.from,
            txHash: txhash,
        });
        dispatch(loadAccountBalance(sourceTx.from));
        const sentTx = Object.assign({}, sourceTx, {hash: txhash});
        dispatch(trackTx(sentTx));
        dispatch(gotoScreen('transaction', sentTx));
    };
}


function getNonce(address) {
    return api.geth.getTransactionCount(address);
}

function withNonce(tx) {
    return (nonce) => new Promise((resolve, reject) =>
        resolve(Object.assign({}, tx, {nonce}))
    );
}

function incNonce(nonce) {
    return new Promise((resolve) => {
        const nonceDec = toNumber(nonce);
        resolve(toHex(nonceDec + 1));
    });
}

function verifySender(expected) {
    return (raw) =>
        new Promise((resolve, reject) => {
            const tx = new EthereumTx(raw);
            if (tx.verifySignature()) {
                if (`0x${tx.getSenderAddress().toString('hex').toLowerCase()}` !== expected.toLowerCase()) {
                    log.error(`WRONG SENDER: 0x${tx.getSenderAddress().toString('hex')} != ${expected}`);
                    reject(new Error('Emerald Vault returned signature from wrong Sender'));
                } else {
                    resolve(raw);
                }
            } else {
                log.error(`Invalid signature: ${raw}`);
                reject(new Error('Emerald Vault returned invalid signature for the transaction'));
            }
        });
}

function emeraldSign(txData, chain) {
    return api.emerald.signTransaction(txData, chain);
}

export function sendTransaction(accountId, passphrase, to, gas, gasPrice, value) {
    const originalTx = {
        from: accountId,
        passphrase,
        to,
        gas,
        gasPrice,
        value,
    };
    originalTx.passPhrase = originalTx.passPhrase || ''; // for HW key
    return (dispatch, getState) => {
        const chain = currentChain(getState());
        getNonce(accountId)
            .then(withNonce(originalTx))
            .then((tx) =>
                emeraldSign(tx, chain)
                    .then(unwrap)
                    .then(verifySender(accountId))
                    .then(sendRawTransaction)
                    .then(onTxSend(dispatch, tx))
                    .catch(catchError(dispatch))
            )
            .catch(catchError(dispatch));
    };
}

export function createContract(accountId, passphrase, gas, gasPrice, data) {
    const txData = {
        from: accountId,
        passphrase,
        gas,
        gasPrice,
        data,
    };
    return (dispatch, getState) => {
        const chain = currentChain(getState());
        api.emerald.signTransaction(txData, { chain })
            .then(unwrap)
            .then(sendRawTransaction)
            .then(onTxSend(dispatch, accountId))
            .catch(log.error);
    };
}

function readWalletFile(wallet) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(wallet);
        reader.onload = (event) => {
            let data;
            try {
                data = JSON.parse(event.target.result);
                data.filename = wallet.name;
                resolve(data);
            } catch (e) {
                reject({error: e});
            }
        };
    });
}

export function importJson(data, name, description) {
    return (dispatch, getState) => {
        const chain = currentChain(getState());
        data.name = name;
        data.description = description;
        return api.emerald.importAccount(data, chain).then((result) => {
            dispatch({
                type: 'ACCOUNT/IMPORT_WALLET',
                accountId: result,
            });
            // Reload accounts.
            if (isAddress(result) === undefined) {
                dispatch({
                    type: 'ACCOUNT/ADD_ACCOUNT',
                    accountId: result,
                    name,
                    description,
                });
                dispatch(loadAccountBalance(result));
                return result;
            }
            throw new Error(result);
        });
    };
}

export function importWallet(wallet, name, description) {
    return (dispatch, getState) => {
        return readWalletFile(wallet).then((data) => {
            return dispatch(importJson(data, name, description));
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

export function loadSettings() {
    return (dispatch) => {
        if (localStorage) {
            let localeCurrency = localStorage.getItem('localeCurrency');
            localeCurrency = (localeCurrency === null) ? 'USD' : localeCurrency;
            dispatch({
                type: 'ACCOUNT/SET_LOCALE_CURRENCY',
                currency: localeCurrency,
            });
        }
    };
}

export function loadPendingTransactions() {
    return (dispatch, getState) =>
        api.geth.getBlockByNumber('pending', true)
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
        api.geth.getTransactionByHash(hash).then((result) => {
            if (!result) {
                log.info(`No tx for hash ${hash}`);
                dispatch({
                    type: 'ACCOUNT/TRACKED_TX_NOTFOUND',
                    hash,
                });
            } else if (typeof result === 'object') {
                dispatch({
                    type: 'ACCOUNT/UPDATE_TX',
                    tx: result,
                });
                /** TODO: Check for input data **/
                if ((result.creates !== undefined) && (isAddress(result.creates) === undefined)) {
                    dispatch({
                        type: 'CONTRACT/UPDATE_CONTRACT',
                        tx: result,
                        address: result.creates,
                    });
                }
            }
        });
}

/**
 * Refresh only tx with totalRetries <= 10
 */
export function refreshTrackedTransactions() {
    return (dispatch, getState) => {
        getState().accounts.get('trackedTransactions')
            .filter((tx) => tx.get('totalRetries', 0) <= 10)
            .map((tx) => dispatch(refreshTransaction(tx.get('hash')))
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
        api.geth.gasPrice().then((result) => {
            dispatch({
                type: 'ACCOUNT/GAS_PRICE',
                value: result,
            });
        }).catch((error) => log.error(error));
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
