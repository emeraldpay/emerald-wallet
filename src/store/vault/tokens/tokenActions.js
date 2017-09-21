/* @flow */
import { convert } from 'emerald-js';
import { parseString, getNakedAddress, fromTokens } from 'lib/convert';
import { api } from 'lib/rpc/api';
import { TokenAbi } from 'lib/erc20';
import Contract from 'lib/contract';

import createLogger from '../../../utils/logger';

const { toNumber } = convert;
const tokenContract = new Contract(TokenAbi);

const log = createLogger('tokenActions');

type TokenInfo = {
    address: string,
}

export function loadTokenBalanceOf(token: TokenInfo, accountId: string) {
    return (dispatch) => {
        if (token.address) {
            const data = tokenContract.functionToData('balanceOf', { _owner: accountId });
            return api.geth.eth.call(token.address, data).then((result) => {
                dispatch({
                    type: 'ACCOUNT/SET_TOKEN_BALANCE',
                    accountId,
                    token,
                    value: result,
                });
            });
        }
        log.warn(`Invalid token data ${JSON.stringify(token)}`);
    };
}

export function loadTokenDetails(token) {
    return (dispatch, getState) => {
        return Promise.all([
            api.geth.eth.call(token.address, tokenContract.functionToData('totalSupply')),
            api.geth.eth.call(token.address, tokenContract.functionToData('decimals')),
            api.geth.eth.call(token.address, tokenContract.functionToData('symbol')),
        ]).then((results) => {
            dispatch({
                type: 'TOKEN/SET_INFO',
                address: token.address,
                totalSupply: results[0],
                decimals: results[1],
                symbol: parseString(results[2]),
            });
        });
    };
}

export function fetchTokenDetails(tokenAddress: string): Promise<any> {
    return Promise.all([
        api.geth.eth.call(tokenAddress, tokenContract.functionToData('totalSupply')),
        api.geth.eth.call(tokenAddress, tokenContract.functionToData('decimals')),
        api.geth.eth.call(tokenAddress, tokenContract.functionToData('symbol')),
    ]).then((results) => {
        return {
            address: tokenAddress,
            totalSupply: results[0],
            decimals: results[1],
            symbol: parseString(results[2]),
        };
    });
}

export function loadTokenBalances(token: TokenInfo) {
    return (dispatch, getState) => {
        const tokenInfo = getState().tokens.get('tokens').find((t) => t.get('address') === token.address).toJS();
        const accounts = getState().accounts;
        if (!accounts.get('loading')) {
            accounts.get('accounts').forEach((acct) => dispatch(loadTokenBalanceOf(tokenInfo, acct.get('id'))));
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
        api.geth.call('emerald_contracts', []).then((result) => {
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

export function addToken(address: string, name) {
    return (dispatch) => {
        return api.emerald.addContract(address, name).then((result) => {
            return fetchTokenDetails(address).then((tokenInfo) => {
                dispatch({
                    type: 'TOKEN/ADD_TOKEN',
                    address,
                    name,
                });
                return dispatch({
                    type: 'TOKEN/SET_INFO',
                    address: tokenInfo.address,
                    totalSupply: tokenInfo.totalSupply,
                    decimals: tokenInfo.decimals,
                    symbol: tokenInfo.symbol,
                });
            });
        });
    };
}

function createTokenTransaction(token, to, value, isTransfer) {
    const address = getNakedAddress(to);
    const numTokens = fromTokens(value, token.get('decimals'));
    if (isTransfer === 'true') {
        return tokenContract.functionToData('transfer', { _to: address, _value: numTokens });
    }
    return tokenContract.functionToData('approve', { _spender: address, _amount: numTokens });
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
        return api.geth.raw(call, params);
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
