import { rpc } from '../lib/rpcapi';

export function loadContractList() {
    return (dispatch) => {
        dispatch({
            type: 'CONTRACT/LOADING',
        });
        rpc('emerald_contracts', []).then((json) => {
            dispatch({
                type: 'CONTRACT/SET_LIST',
                contracts: json.result,
            });
            // load Contract details?
        });
    };
}

export function addContract(address, name, abi) {
    return (dispatch) =>
        rpc('emerald_addContract', [{
            address,
            name,
            abi
        }]).then((json) => {
            dispatch({
                type: 'CONTRACT/ADD_CONTRACT',
                address: address,
                name: name,
                abi: abi
            });
        });
}
