import { rpc } from '../lib/rpcapi'
import { parseString } from '../lib/convert'

/*
 * json.result should return a list of tokens. 
 * Each token should have name, contract address, and ABI
*/
export function loadTokenList() {
    return function (dispatch) {
        dispatch({
            type: 'TOKEN/LOADING'
        });
        rpc("emerald_contracts", []).then((json) => {
            const tokens = json.result.filter((contract) => {
                contract.features = contract.features || [];
                return contract.features.indexOf('erc20') >= 0
            });
            dispatch({
                type: 'TOKEN/SET_LIST',
                tokens: tokens
            });
            tokens.map((token) => dispatch(loadTokenDetails(token)))
        });
    }
}

export function loadTokenDetails(token) {
    return function (dispatch) {
        const tokenSupplyId = "0x18160ddd";
        const decimalsId =    "0x313ce567";
        const symbolId =      "0x95d89b41";
        const nameId =        "0x06fdde03";
        rpc("eth_call", [{to: token.address, data: tokenSupplyId}, "latest"]).then((resp) => {
            dispatch({
                type: 'TOKEN/SET_TOTAL_SUPPLY',
                address: token.address,
                value: resp.result
            })
        });
        rpc("eth_call", [{to: token.address, data: decimalsId}, "latest"]).then((resp) => {
            dispatch({
                type: 'TOKEN/SET_DECIMALS',
                address: token.address,
                value: resp.result
            })
        });
        rpc("eth_call", [{to: token.address, data: symbolId}, "latest"]).then((resp) => {
            dispatch({
                type: 'TOKEN/SET_SYMBOL',
                address: token.address,
                value: parseString(resp.result)
            })
        });
    }
}

