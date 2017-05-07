import { rpc } from '../lib/rpc';
import log from 'loglevel';
import { functionToData } from '../lib/convert';

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

export function callContract(accountId, password, to, gas, value, func, inputs) {
    console.log(func)
    return (dispatch) => {
        let pwHeader = null;
        if (password)
            pwHeader = new Buffer(password).toString('base64');
        const data = functionToData(func, inputs);
        return rpc.call('eth_call', [{
            to,
            from: accountId,
            gas,
            value,
            data,
        }, 'latest'], {
            Authorization: pwHeader,
        }).then((result) => {
            dispatch({
                type: 'ACCOUNT/CALL_CONTRACT',
                accountId,
                txHash: result,
            });
            return result;
        });
    };
}

export function estimateGas(data) {
    return (dispatch) =>
        rpc.call('eth_estimateGas', [{ data }]).then((result) => {
            return isNaN(parseInt(result)) ? 0 : parseInt(result);
        });
}
