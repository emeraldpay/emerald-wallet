import { rpc } from 'lib/rpc';
import { getRates } from 'lib/marketApi';
import { address } from 'lib/validators';
import { loadTokenBalanceOf } from './tokenActions';

export function loadAccountBalance(accountId) {
    return (dispatch, getState) => {
        rpc.call('eth_getBalance', [accountId, 'latest']).then((result) => {
            dispatch({
                type: 'ACCOUNT/SET_BALANCE',
                accountId,
                value: result,
            });
        });
        const tokens = getState().tokens;
        if (!tokens.get('loading')) {
            tokens.get('tokens')
              .map((token) => dispatch(loadTokenBalanceOf(token, accountId)));
        }
    };
}

export function loadAccountsList() {
    return (dispatch) => {
        dispatch({
            type: 'ACCOUNT/LOADING',
        });
        rpc.call('eth_accounts', []).then((result) => {
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
 * WARNING: In order for this rpc call to work,
 * "personal" API must be enabled over RPC
 *    eg. --rpcapi "eth,web3,personal"
 *      [Unsafe. Not recommended. Use IPC instead.]
 *
 * TODO: Error handling
*/
export function createAccount(password, name, description) {
    return (dispatch) =>
        rpc.call('personal_newAccount', [{
            password,
            name,
            description,
        }]).then((result) => {
            dispatch({
                type: 'ACCOUNT/ADD_ACCOUNT',
                accountId: result,
                name,
                description,
            });
            dispatch(loadAccountBalance(result));
        });
}

export function sendTransaction(accountId, password, to, gas, gasPrice, value) {
    return (dispatch) =>
        rpc.call('eth_sendTransaction', [{
            from: accountId,
            password,
            to,
            gas,
            gasPrice,
            value,
        }]).then((result) => {
            dispatch({
                type: 'ACCOUNT/SEND_TRANSACTION',
                accountId,
                txHash: result,
            });
            dispatch(loadAccountBalance(accountId));
            return result;
        });
}

export function createContract(accountId, password, gas, gasPrice, data) {
    return (dispatch) =>
        rpc.call('eth_sendTransaction', [{
            from: accountId,
            password,
            gas,
            gasPrice,
            data,
        }]).then((result) => {
            dispatch({
                type: 'ACCOUNT/SEND_TRANSACTION',
                accountId,
                txHash: result,
            });
            dispatch(loadAccountBalance(accountId));
            return result;
        });
}

export function importWallet(wallet, name, description) {
    return (dispatch) => {
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
                return rpc.call('backend_importWallet', data).then((result) => {
                    dispatch({
                        type: 'ACCOUNT/IMPORT_WALLET',
                        accountId: result,
                    });
                    dispatch(loadAccountBalance(result));
                    if (address(result))
                        resolve(result);
                    else
                        reject({error: result});
                })
            };
        });
    };
}

export function refreshTransactions(hash) {
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

export function refreshTrackedTransactions() {
    return (dispatch, getState) =>
        getState().accounts.get('trackedTransactions').map(
            (tx) => dispatch(refreshTransactions(tx.get('hash')))
        );
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
