// @flow
import BigNumber from 'bignumber.js';
import { parseString } from '../../../lib/convert';
import { TokenAbi } from '../../../lib/erc20';
import Contract from '../../../lib/contract';
import { detect as detectTraceCall } from '../../../lib/traceCall';
import launcher from '../../launcher';
import ActionTypes from './actionTypes';
import createLogger from '../../../utils/logger';

const tokenContract = new Contract(TokenAbi);

const log = createLogger('tokenActions');

type TokenInfo = {
    address: string,
    symbol: string,
    decimals: string,
}

export function loadTokenBalanceOf(token: TokenInfo, accountId: string) {
  return (dispatch: any, getState: any, api: any) => {
    if (token.address) {
      const data = tokenContract.functionToData('balanceOf', { _owner: accountId });
      return api.geth.eth.call(token.address, data).then((result) => {
        dispatch({
          type: ActionTypes.SET_TOKEN_BALANCE,
          accountId,
          token,
          value: result,
        });
      });
    }
    throw new Error(`Invalid token info ${JSON.stringify(token)}`);
  };
}

export function loadTokenDetails(token): () => Promise<any> {
  return (dispatch, getState, api) => {
    const batch = [
      { id: 'totalSupply', to: token.address, data: tokenContract.functionToData('totalSupply') },
      { id: 'decimals', to: token.address, data: tokenContract.functionToData('decimals') },
      { id: 'symbol', to: token.address, data: tokenContract.functionToData('symbol') },
    ];

    return api.geth.ext.batchCall(batch).then((results: Array<any>) => {
      dispatch({
        type: ActionTypes.SET_INFO,
        address: token.address,
        totalSupply: results.totalSupply.result,
        decimals: results.decimals.result,
        symbol: parseString(results.symbol.result),
      });
    });
  };
}

export function fetchTokenDetails(tokenAddress: string): () => Promise<any> {
  return (dispatch, getState, api) => {
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
  };
}

export function loadTokenBalances(token: TokenInfo) {
  return (dispatch, getState) => {
    const tokenInfo = getState().tokens.get('tokens').find((t) => t.get('address') === token.address).toJS();
    const accounts = getState().accounts;
    if (!accounts.get('loading')) {
      const addresses = accounts.get('accounts').map((acc) => acc.get('id')).toJS();
      dispatch(getTokenBalances(tokenInfo, addresses));
    }
  };
}

function getTokenBalances(token: TokenInfo, addresses: Array<string>) {
  return (dispatch: any, getState: any, api: any) => {
    if (token.address) {
      // build batch call request
      const batch = addresses.map((addr) => {
        return {
          id: addr,
          to: token.address,
          data: tokenContract.functionToData('balanceOf', { _owner: addr }),
        };
      });

      return api.geth.ext.batchCall(batch).then((results) => {
        addresses.forEach((addr) => {
          dispatch({
            type: ActionTypes.SET_TOKEN_BALANCE,
            accountId: addr,
            token,
            value: results[addr].result,
          });
        });
      });
    }
    throw new Error(`Invalid token info ${JSON.stringify(token)}`);
  };
}
/**
 * Load ERC20 contracts from Emerald Vault, gets token details from smart contract
 */
export function loadTokenList() {
  return (dispatch, getState, api) => {
    dispatch({
      type: ActionTypes.LOADING,
    });
    const chain = launcher.selectors.getChainName(getState());
    api.emerald.listContracts(chain).then((result) => {
      // TODO: After features support
      // const tokens = result ? result.filter((contract) => {
      //     contract.features = contract.features || [];
      //     return contract.features.indexOf('erc20') >= 0;
      // }) : [];

      const tokens = result;

      dispatch({
        type: ActionTypes.SET_LIST,
        tokens,
      });
      tokens.map((token) => dispatch(loadTokenDetails(token)));
    });
  };
}

export function addToken(token: TokenInfo) {
  return (dispatch, getState, api) => {
    const chain = launcher.selectors.getChainName(getState());
    return api.emerald.importContract(token.address, token.symbol, '', chain).then(() => {
      // TODO: maybe replace with one action
      dispatch({
        type: ActionTypes.ADD_TOKEN,
        address: token.address,
        name: token.symbol,
      });
      return dispatch({
        type: ActionTypes.SET_INFO,
        address: token.address,
        totalSupply: token.totalSupply,
        decimals: token.decimals,
        symbol: token.symbol,
      });
    });
  };
}

// FIXME: deprecated
export function traceCall(from: string, to: string, gas: string, gasPrice: string, value: string, data: string) {
  return (dispatch, getState, api) => {
    // TODO: We shouldn't detect trace api each time, we need to do it only once
    return detectTraceCall(api.geth).then((constructor) => {
      const tracer = constructor({ from, to, gas, gasPrice, value, data });
      const call = tracer.buildRequest();
      return api.geth.raw(call.method, call.params)
        .then((result) => tracer.estimateGas(result));
    });
  };
}

export function createTokenTxData(to: string, amount: BigNumber, isTransfer: boolean): string {
  const value = amount.toString(10);
  if (isTransfer === 'true') {
    return tokenContract.functionToData('transfer', { _to: to, _value: value });
  }
  return tokenContract.functionToData('approve', { _spender: to, _amount: value });
}
