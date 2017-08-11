import { api } from 'lib/rpc/api';

export function loadAddressBalance(addressId) {
    return (dispatch) => {
        rpc.call('eth_getBalance', [addressId, 'latest']).then((result) => {
            dispatch({
                type: 'ADDRESS/SET_BALANCE',
                addressId,
                value: result,
            });
        });
    };
}

export function loadAddressBook() {
    return (dispatch) => {
        dispatch({
            type: 'ADDRESS/LOADING',
        });
        rpc.call('emerald_addressBook', []).then((result) => {
            dispatch({
                type: 'ADDRESS/SET_BOOK',
                addressBook: result,
            });
            result.map((addr) =>
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
        }]).then((result) => {
            dispatch({
                type: 'ADDRESS/ADD_ADDRESS',
                addressId: id,
                name,
                description,
            });
            dispatch(loadAddressBalance(id));
        });
}

export function updateAddress(id, name, description) {
    return (dispatch) =>
        rpc.call('emerald_updateAddress', [{
            id,
            name,
            description,
        }]).then((result) => {
            dispatch({
                type: 'ADDRESS/UPDATE_ADDRESS',
                addressId: id,
                name,
                description,
            });
        });
}

export function deleteAddress(addressId) {
    return (dispatch) =>
        rpc.call('emerald_deleteAddress', [addressId]).then(() => {
            dispatch({
                type: 'ADDRESS/DELETE_ADDRESS',
                addressId,
            });
        });
}
