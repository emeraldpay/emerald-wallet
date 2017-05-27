import { rpc } from 'lib/rpc';
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
            result.map((acct) => dispatch(loadAccountBalance(acct))
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
        const reader = new FileReader();
        reader.readAsText(wallet);
        reader.onload = (event) => {
            let data = JSON.parse(event.target.result);
            data.filename = wallet.name;
            data.name = name;
            data.description = description;
            rpc.call('backend_importWallet', data).then((result) => {
                dispatch({
                    type: 'ACCOUNT/IMPORT_WALLET',
                    accountId: result,
                });
                dispatch(loadAccountBalance(result));
            });
        };
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
