import { rpc } from '../lib/rpc';
import log from 'loglevel';

export function loadContractList() {
    return (dispatch) => {
        dispatch({
            type: 'CONTRACT/LOADING',
        });
        rpc.call('emerald_contracts', []).then((result) => {
            dispatch({
                type: 'CONTRACT/SET_LIST',
                contracts: result,
            });
            // load Contract details?
        }).catch(error => {
          log.error(`emerald_contracts rpc call: ${JSON.stringify(error)}`);
        });
    };
}

export function addContract(address, name, abi, version, options, txhash) {
    return (dispatch) =>
        rpc.call('emerald_addContract', [{
            address,
            name,
            abi,
            version,
            options,
            txhash,
        }]).then((result) => {
            dispatch({
                type: 'CONTRACT/ADD_CONTRACT',
                address,
                name,
                abi,
                version,
                options,
                txhash,
            });
        });
}

export function estimateGas(data) {
    return (dispatch) =>
        rpc.call('eth_estimateGas', [{ data }]).then((result) => {
            return isNaN(parseInt(result)) ? 0 : parseInt(result);
        });
}
