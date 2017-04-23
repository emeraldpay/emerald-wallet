import { rpc } from 'lib/rpc';
import { address } from 'lib/validators';


export function loadAddressBalance(addressId) {
    return (dispatch, getState) => {
        rpc.call('eth_getBalance', [addressId, 'latest']).then((json) => {
            dispatch({
                type: 'ADDRESS/SET_BALANCE',
                addressId,
                value: json.result,
            });
        });
    };
}

export function loadAddressBook() {
    return (dispatch) => {
        dispatch({
            type: 'ADDRESS/LOADING',
        });
        rpc.call('eth_addressBook', []).then((json) => {
            dispatch({
                type: 'ADDRESS/SET_BOOK',
                addresss: json.result,
            });
            json.result.map((acct) =>
                dispatch(loadAddressBalance(acct))
            );
        });
    };
}

export function loadAddressTxCount(addressId) {
    return (dispatch) => {
        rpc.call('eth_getTransactionCount', [addressId, 'latest']).then((json) => {
            dispatch({
                type: 'ADDRESS/SET_TXCOUNT',
                addressId,
                value: json.result,
            });
        });
    };
}

export function createAddress(name, password) {
    return (dispatch) =>
        rpc.call('personal_newaddress', [password]).then((json) => {
            dispatch({
                type: 'address/ADD_address',
                addressId: json.result,
                name,
            });
            dispatch(loadAddressBalance(json.result));
        });
}