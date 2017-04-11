import { rpc } from '../lib/rpcapi';
import log from 'loglevel';

export function loadContractList() {
    return (dispatch) => {
        dispatch({
            type: 'CONTRACT/LOADING',
        });
        rpc('emerald_contracts', []).then((json) => {
            if (json.error) {
                log.error(`emerald_contracts rpc call: ${JSON.stringify(json)}`)
            }
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
            abi,
        }]).then((json) => {
            dispatch({
                type: 'CONTRACT/ADD_CONTRACT',
                address,
                name,
                abi,
            });
        });
}
