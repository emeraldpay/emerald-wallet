/* eslint-disable no-undef */
import launcher from '../../launcher';
import ActionTypes from './actionTypes';

export function loadAddressBook() {
  return (dispatch, getState, api) => {
    dispatch({
      type: ActionTypes.LOADING,
    });
    const chain = launcher.selectors.getChainName(getState());
    api.emerald.listAddresses(chain).then((result) => {
      dispatch({
        type: ActionTypes.SET_BOOK,
        addressBook: result,
      });
    });
  };
}

export function addAddress(address, name, description) {
  return (dispatch, getState, api) => {
    const chain = launcher.selectors.getChainName(getState());
    return api.emerald.importAddress({address, name, description}, chain).then((result) => {
      dispatch({
        type: ActionTypes.ADD_ADDRESS,
        address,
        name,
        description,
      });
    });
  };
}

export function updateAddress(id, name, description) {
  return (dispatch) => rpc.call('emerald_updateAddress', [{
    id,
    name,
    description,
  }]).then((result) => {
    dispatch({
      type: ActionTypes.UPDATE_ADDRESS,
      addressId: id,
      name,
      description,
    });
  });
}

export function deleteAddress(address) {
  return (dispatch, getState, api) => {
    const chain = launcher.selectors.getChainName(getState());
    return api.emerald.deleteAddress(address, chain).then(() => {
      dispatch({
        type: ActionTypes.DELETE_ADDRESS,
        address,
      });
    });
  };
}
