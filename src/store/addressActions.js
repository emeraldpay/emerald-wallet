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
        rpc.call('emerald_addressBook', []).then((json) => {
            dispatch({
                type: 'ADDRESS/SET_BOOK',
                addressBook: json.result,
            });
            json.result.map((addr) =>
                dispatch(loadAddressBalance(addr.id))
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
        rpc.call('emerald_addAddress', [password]).then((json) => {
            dispatch({
                type: 'ADDRESS/ADD_ADDRESS',
                addressId: json.result,
                name,
            });
            dispatch(loadAddressBalance(json.result));
        });
}