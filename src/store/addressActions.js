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

export function addAddress(id, name, description) {
    return (dispatch) =>
        rpc.call('emerald_addAddress', [{
            id,
            name,
            description,
        }]).then((json) => {
            dispatch({
                type: 'ADDRESS/ADD_ADDRESS',
                addressId: json.result,
                name,
                description,
            });
            dispatch(loadAddressBalance(json.result));
        });
}

export function updateAddress(id, name, description) {
    return (dispatch) =>
        rpc.call('emerald_updateAddress', [{
            id,
            name,
            description,
        }]).then((json) => {
            dispatch({
                type: 'ADDRESS/UPDATE_ADDRESS',
                addressId: json.result,
                name,
                description,
            });
        });
}

export function deleteAddress(addressId) {
    return (dispatch) =>
        rpc.call('emerald_deleteAddress', [addressId]).then((json) => {
            dispatch({
                type: 'ADDRESS/DELETE_ADDRESS',
                addressId,
            });
        });
}