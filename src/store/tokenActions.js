import { rpc } from '../lib/rpc';
import Immutable from 'immutable';
import { parseString, getNakedAddress, fromTokens, functionToData, getFunctionSignature } from 'lib/convert';

/** Abbreviated ABI for ERC20-compatible tokens **/
const TokenAbi = [
    {name:'approve',
        inputs:[{name:'_spender',type:'address'},
                {name:'_amount',type:'uint256'}],
        outputs:[{name:'success',type:'bool'}]},
    {name:'totalSupply',
        inputs:[],
        outputs:[{name:'',type:'uint256'}]},
    {name:'divisor',
        inputs:[],
        outputs:[{name:'divisor',type:'uint256'}]},
    {name:'transferFrom',
        inputs:[{name:'_from',type:'address'},
                  {name:'_to',type:'address'},
                  {name:'_value',type:'uint256'}],
        outputs:[{name:'success',type:'bool'}]},
    {name:'balanceOf',
        inputs:[{name:'_owner',type:'address'}],
        outputs:[{name:'balance',type:'uint256'}]},
    {name:'transfer',
        inputs:[{name:'_to',type:'address'},{name:'_value',type:'uint256'}],
        outputs:[{name:'success',type:'bool'}]},
    {name:'symbol',
        inputs:[],
        outputs:[{name:'',type:'string'}]},
    {name:'name',
        inputs:[],
        outputs:[{name:'',type:'string'}]},
    {name:'decimals',
        inputs:[],
        outputs:[{name:'',type:'uint8'}]}
        ];

function getFunction(name) {
    return Immutable.fromJS(
        TokenAbi.find((f) => (f.name === name))
        );
}

export function loadTokenBalanceOf(token, accountId) {
    return (dispatch) => {
        const data = functionToData(getFunction('balanceOf'),
            { _owner: getNakedAddress(accountId) });
        rpc.call('eth_call', [{ to: token.address, data }, 'latest']).then((result) =>
            dispatch({
                type: 'ACCOUNT/SET_TOKEN_BALANCE',
                accountId,
                token,
                value: result,
            })
        );
    };
}

export function loadTokenDetails(token) {
    return (dispatch, getState) => {
        rpc.call('eth_call', [{
            to: token.address,
            data: getFunctionSignature(getFunction('totalSupply')) },
            'latest']).then((result) => {
                dispatch({
                    type: 'TOKEN/SET_TOTAL_SUPPLY',
                    address: token.address,
                    value: result,
                });
            });
        rpc.call('eth_call', [{ to: token.address,
            data: getFunctionSignature(getFunction('decimals')) },
            'latest']).then((result) => {
                dispatch({
                    type: 'TOKEN/SET_DECIMALS',
                    address: token.address,
                    value: result,
                });
            });
        rpc.call('eth_call', [{ to: token.address,
            data: getFunctionSignature(getFunction('symbol')) },
            'latest']).then((result) => {
                dispatch({
                    type: 'TOKEN/SET_SYMBOL',
                    address: token.address,
                    value: parseString(result),
                });
            });
        const accounts = getState().accounts;
        if (!accounts.get('loading')) {
            accounts.get('accounts')
                    .map((acct) => dispatch(loadTokenBalanceOf(token, acct.get('id'))));
        }
    };
}

/*
 * json.result should return a list of tokens.
 * Each token should have name, contract address, and ABI
 */
export function loadTokenList() {
    return (dispatch) => {
        dispatch({
            type: 'TOKEN/LOADING',
        });
        rpc.call('emerald_contracts', []).then((result) => {
            const tokens = result ? result.filter((contract) => {
                contract.features = contract.features || [];
                return contract.features.indexOf('erc20') >= 0;
            }) : [];
            dispatch({
                type: 'TOKEN/SET_LIST',
                tokens,
            });
            tokens.map((token) => dispatch(loadTokenDetails(token)));
        });
    };
}

export function addToken(address, name) {
    return (dispatch) =>
        rpc.call('emerald_addContract', [{
            address,
            name,
        }]).then((result) => {
            dispatch({
                type: 'TOKEN/ADD_TOKEN',
                address,
                name,
            });
            dispatch(loadTokenDetails({ address }));
        });
}

function createTokenTransaction(token, to, value, isTransfer) {
    const address = getNakedAddress(to);
    const numTokens = fromTokens(value, token.get('decimals'));
    if (isTransfer === 'true')
        return functionToData(getFunction('transfer'),
            { _to: address, _value: numTokens });
    else
        return functionToData(getFunction('approve'),
            { _spender: address, _amount: numTokens });
}


export function transferTokenTransaction(accountId, password, to, gas, gasPrice, value, tokenId, isTransfer) {
    return (dispatch, getState) => {
        const pwHeader = new Buffer(password).toString('base64');
        const tokens = getState().tokens;
        const token = tokens.get('tokens').find((tok) => tok.get('address') === tokenId);
        const data = createTokenTransaction(token, to, value, isTransfer);
        return rpc.call('eth_sendTransaction', [{
            to: tokenId,
            password,
            from: accountId,
            gas,
            gasPrice,
            value: '0x00',
            data,
        }, 'latest']).then((result) => {
            dispatch({
                type: 'ACCOUNT/SEND_TOKEN_TRANSACTION',
                accountId,
                txHash: result,
            });
            dispatch(loadTokenDetails({ address: token }));
            return result;
        });
    };
}

export function traceCall(accountId, to, gas, gasPrice, value, data) {
    return (dispatch, getState) => {
        const gethClient = getState().launcher.get('chain').get('client')
            .substring(0, 4).toLowerCase() === 'geth';
        const call = gethClient ? 'eth_traceCall' : 'trace_call';
        const params = [{
            from: accountId,
            to,
            gas,
            gasPrice,
            value,
            data,
        }];
        if (!gethClient) {
            params.push(['trace', 'stateDiff']);
        }
        params.push('latest');
        return rpc.call(call, params);
    };
}

export function traceTokenTransaction(accountId, to, gas, gasPrice, value, tokenId, isTransfer) {
    return (dispatch, getState) => {
        const tokens = getState().tokens;
        const token = tokens.get('tokens').find((tok) => tok.get('address') === tokenId);
        const data = createTokenTransaction(token, to, value, isTransfer);
        return traceCall(accountId, tokenId, gas, gasPrice, '0x00', data);
    };
}
