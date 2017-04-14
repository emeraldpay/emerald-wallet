import { rpc } from 'lib/rpcapi';
import { address } from 'lib/validators';
import { loadTokenBalanceOf } from './tokenActions';


export function loadAccountBalance(accountId) {
    return (dispatch, getState) => {
        rpc('eth_getBalance', [accountId, 'latest']).then((json) => {
            dispatch({
                type: 'ACCOUNT/SET_BALANCE',
                accountId,
                value: json.result,
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
        rpc('eth_accounts', []).then((json) => {
            dispatch({
                type: 'ACCOUNT/SET_LIST',
                accounts: json.result,
            });
            json.result.map((acct) =>
                dispatch(loadAccountBalance(acct))
            );
        });
    };
}

export function loadAccountTxCount(accountId) {
    return (dispatch) => {
        rpc('eth_getTransactionCount', [accountId, 'latest']).then((json) => {
            dispatch({
                type: 'ACCOUNT/SET_TXCOUNT',
                accountId,
                value: json.result,
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
export function createAccount(name, password) {
    return (dispatch) =>
        rpc('personal_newAccount', [password]).then((json) => {
            dispatch({
                type: 'ACCOUNT/ADD_ACCOUNT',
                accountId: json.result,
                name,
            });
            dispatch(loadAccountBalance(json.result));
        });
}

export function sendTransaction(accountId, to, gas, gasPrice, value) {
    return (dispatch) =>
        rpc('eth_sendTransaction', [{
            from: accountId,
            to,
            gas,
            gasPrice,
            value,
        }]).then((json) => {
            dispatch({
                type: 'ACCOUNT/SEND_TRANSACTION',
                accountId,
                txHash: json.result,
            });
            dispatch(loadAccountBalance(accountId));
            return json.result;
        });
}

export function createContract(accountId, gas, gasPrice, data) {
    return (dispatch) =>
        rpc('eth_sendTransaction', [{
            from: accountId,
            gas,
            gasPrice,
            data,
        }]).then((json) => {
            dispatch({
                type: 'ACCOUNT/SEND_TRANSACTION',
                accountId,
                txHash: json.result,
            });
            dispatch(loadAccountBalance(accountId));
            return json.result;
        });
}

export function importWallet(wallet) {
    return (dispatch) =>
        rpc('backend_importWallet', {
            wallet,
        }).then((json) => {
            dispatch({
                type: 'ACCOUNT/IMPORT_WALLET',
                accountId: json.result,
            });
            dispatch(loadAccountBalance(json.result));
        });
}

export function refreshTransactions(hash) {
    return (dispatch) =>
        rpc('eth_getTransactionByHash', [hash]).then((json) => {
            if (typeof json.result === 'object') {
                dispatch({
                    type: 'ACCOUNT/UPDATE_TX',
                    tx: json.result,
                });
                /** TODO: Check for input data **/
                if ((json.result.creates !== undefined) && (address(json.result.creates) === undefined)) {
                    dispatch({
                        type: 'CONTRACT/UPDATE_CONTRACT',
                        tx: json.result,
                        address: json.result.creates,
                    });
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

export function trackTx(hash) {
    return {
        type: 'ACCOUNT/TRACK_TX',
        hash,
    };
}
