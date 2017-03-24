import { rpc } from '../lib/rpcapi'
import { ipc } from '../lib/ipcapi'

/*
 * json.result should return a list of tokens. 
 * Each token should have name, contract address, decimal, symbol, ABI
*/
export function loadTokenList() {
    return function (dispatch) {
        dispatch({
            type: 'TOKEN/LOADING'
        });
        ipc("eth_tokens", []).then((json) => {
            dispatch({
                type: 'TOKEN/SET_LIST',
                tokens: json.result
            });
            json.result.map((token) => dispatch(loadTokenBalance(token)))
        });
    }
}

export function loadTokenBalance(token) {
    return function (dispatch) {
        ipc("eth_getTokenSupply", [token.id, "latest"]).then((json) => {
            dispatch({
                type: 'TOKEN/SET_TOTAL_SUPPLY',
                tokenId: token.id,
                decimal: token.decimal,
                value: json.result
            })
        });
    }
}