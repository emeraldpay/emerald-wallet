/* @flow */
import log from 'electron-log';
import EthereumTx from 'ethereumjs-tx';
import { convert } from 'emerald-js';
import { api } from '../lib/rpc/api';

import { address as isAddress} from '../lib/validators';
import { loadTokenBalanceOf } from './tokenActions';
import { gotoScreen, catchError } from './wallet/screen/screenActions';
import Wallet from '../lib/wallet';

import { trackTx, processPending } from './wallet/history/historyActions';

const { toNumber, toHex } = convert;
const currentChain = (state) => state.launcher.getIn(['chain', 'name']);

type Transaction = {
    from: string,
    to?: string,
    value: string,
    nonce: string,
    gas: string,
    gasPrice: string,
}

export function loadAccountBalance(address: string) {
    return (dispatch, getState) => {
        api.geth.eth.getBalance(address).then((result) => {
            dispatch({
                type: 'ACCOUNT/SET_BALANCE',
                accountId: address,
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
            api.geth.ext.getBalances(result.map((account) => account.address)).then((balances) => {
                result.forEach((account) => {
                    if (balances[account.address]) {
                        dispatch({
                            type: 'ACCOUNT/SET_BALANCE',
                            accountId: account.address,
                            value: balances[account.address],
                        });
                        // Tokens
                        const tokens = getState().tokens;
                        if (!tokens.get('loading')) {
                            tokens.get('tokens')
                              .map((token) => dispatch(loadTokenBalanceOf(token.toJS(), account.address)));
                        }
                    }
                });
            });
        });
    };
}

export function loadAccountTxCount(accountId: string) {
    return (dispatch) => {
        api.geth.eth.getTransactionCount(accountId).then((result) => {
            dispatch({
                type: 'ACCOUNT/SET_TXCOUNT',
                accountId,
                value: result,
            });
        });
    };
}

export function exportPaperWallet(passphrase: string, accountId: string) {
    return (dispatch, getState) => {
        const chain = currentChain(getState());
        api.emerald.exportAccount(accountId, chain).then((result) => {
            const wallet = Wallet.fromV3(result, passphrase);
            const privKey = wallet.getPrivateKeyString();
            dispatch(gotoScreen('paper-wallet', { address: accountId, privKey }));
        }).catch(catchError(dispatch));
    };
}

export function exportKeyFile(accountId: string) {
    return (dispatch, getState) => {
        const chain = currentChain(getState());
        return api.emerald.exportAccount(accountId, chain);
    };
}

export function createAccount(passphrase: string, name: string = '', description: string = '') {
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

export function updateAccount(address: string, name: string, description?: string) {
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

function sendRawTransaction(signed: string) {
    return api.geth.eth.sendRawTransaction(signed);
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

function onTxSend(dispatch, sourceTx: Transaction) {
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

function getNonce(address: string) {
    return api.geth.eth.getTransactionCount(address);
}

function withNonce(tx: Transaction): (nonce: string) => Promise<Transaction> {
    return (nonce) => new Promise((resolve, reject) =>
        resolve(Object.assign({}, tx, { nonce }))
    );
}

function verifySender(expected) {
    return (raw: string) =>
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

function emeraldSign(txData: Transaction, passphrase: string, chain: string) {
    return api.emerald.signTransaction({ ...txData, passphrase}, chain);
}

export function sendTransaction(from: string, passphrase: string, to: string, gas: string,
                                gasPrice: string, value: string) {
    const originalTx: Transaction = {
        from,
        to,
        gas,
        gasPrice,
        value,
        nonce: '',
    };
    const passPhrase = passphrase || ''; // for HW key
    return (dispatch, getState) => {
        const chain = currentChain(getState());
        getNonce(from)
            .then(withNonce(originalTx))
            .then((tx) =>
                emeraldSign(tx, passPhrase, chain)
                    .then(unwrap)
                    .then(verifySender(from))
                    .then(sendRawTransaction)
                    .then(onTxSend(dispatch, tx))
                    .catch(catchError(dispatch))
            )
            .catch(catchError(dispatch));
    };
}

export function createContract(accountId: string, passphrase: string, gas, gasPrice, data) {
    const txData = {
        from: accountId,
        passphrase,
        gas,
        gasPrice,
        data,
        nonce: '',
        value: '0x0',
    };
    return (dispatch, getState) => {
        const chain = currentChain(getState());
        api.emerald.signTransaction(txData, { chain })
            .then(unwrap)
            .then(sendRawTransaction)
            .then(onTxSend(dispatch, txData))
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

export function importJson(data, name: string, description: string) {
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

export function importWallet(wallet, name: string, description: string) {
    return (dispatch, getState) => {
        return readWalletFile(wallet).then((data) => {
            return dispatch(importJson(data, name, description));
        });
    };
}

export function loadPendingTransactions() {
    return (dispatch, getState) =>
        api.geth.eth.getBlockByNumber('pending', true)
            .then((result) => {
                const addrs = getState().accounts.get('accounts')
                    .map((acc) => acc.get('id'));
                const txes = result.transactions.filter((t) =>
                    (addrs.includes(t.to) || addrs.includes(t.from))
                );
                dispatch(processPending(txes));
                for (const tx of txes) {
                    const disp = {
                        type: 'ACCOUNT/PENDING_BALANCE',
                        value: tx.value,
                        gas: tx.gas,
                        gasPrice: tx.gasPrice,
                        from: '',
                        to: '',
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

