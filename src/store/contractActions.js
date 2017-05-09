import { rpc } from 'lib/rpc';
import log from 'loglevel';
import { functionToData, dataToParams, toNumber } from 'lib/convert';
import { loadAccountBalance } from './accountActions';

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
        }).catch((error) => {
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

/**
 * Call Contract without creating transaction
 * Result of eth_call should be the return value of executed contract.
 */
export function callContract(contractAddress, func, inputs) {
    return (dispatch) => {
        const data = functionToData(func, inputs);
        return rpc.call('eth_call', [{
            to: contractAddress,
            data,
        }, 'latest']).then((result) => {
            const outputs = dataToParams(func, result);
            dispatch({
                type: 'CONTRACT/CALL_CONTRACT',
                contractAddress,
                result: outputs,
            });
            return outputs;
        });
    };
}

export function sendContractTransaction(accountId, password, contractAddress, gas, value, func, inputs) {
    const pwHeader = new Buffer(password).toString('base64');
    const data = functionToData(func, inputs);
    return (dispatch) =>
        rpc.call('eth_sendTransaction', [{
            from: accountId,
            to: contractAddress,
            gas,
            value,
            data,
        }], {
            Authorization: pwHeader,
        }).then((result) => {
            dispatch({
                type: 'ACCOUNT/SEND_TRANSACTION',
                accountId,
                txHash: result,
            });
            dispatch(loadAccountBalance(accountId));
            return result;
        });
}


export function estimateGas(data) {
    return () =>
        rpc.call('eth_estimateGas', [{ data }])
            .then((result) => toNumber(result, 16));
}
