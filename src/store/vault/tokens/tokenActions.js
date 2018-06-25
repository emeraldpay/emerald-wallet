// @flow
import BigNumber from 'bignumber.js';
import { parseString } from '../../../lib/convert';
import { TokenAbi } from '../../../lib/erc20';
import Contract from '../../../lib/contract';
import { detect as detectTraceCall } from '../../../lib/traceCall';
import launcher from '../../../store/launcher';
import ActionTypes from './actionTypes';
import createLogger from '../../../utils/logger';

const tokenContract = new Contract(TokenAbi);

const log = createLogger('tokenActions');

type TokenInfo = {
  address: string,
  symbol: string,
  decimals: string,
}

export function resetBalances() {
  return {
    type: ActionTypes.RESET_BALANCES,
  };
}

/**
 * Load balance of particular token for particular account
 */
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

/**
 * For every account load balance of particular token
 */
export function loadTokenBalances(token: TokenInfo) {
  return (dispatch, getState, api) => {
    const accounts = getState().accounts;
    if (!accounts.get('loading')) {
      // construct batch request
      const batch = [];
      accounts.get('accounts').forEach((acct) => {
        batch.push({
          id: acct.get('id'),
          to: token.address,
          data: tokenContract.functionToData('balanceOf', { _owner: acct.get('id') }),
        });
      });

      return api.geth.ext.batchCall(batch).then((results: Array<any>) => {
        accounts.get('accounts').forEach((acct) => {
          dispatch({
            type: ActionTypes.SET_TOKEN_BALANCE,
            accountId: acct.get('id'),
            value: results[acct.get('id')].result,
            token,
          });
        });
      });
    }
  };
}

export function loadTokenDetails(tokenAddress: string): () => Promise<any> {
  return (dispatch, getState, api) => {
    const batch = [
      { id: 'totalSupply', to: tokenAddress, data: tokenContract.functionToData('totalSupply') },
      { id: 'decimals', to: tokenAddress, data: tokenContract.functionToData('decimals') },
      { id: 'symbol', to: tokenAddress, data: tokenContract.functionToData('symbol') },
    ];

    return api.geth.ext.batchCall(batch).then((results: Array<any>) => {
      dispatch({
        type: ActionTypes.SET_INFO,
        address: tokenAddress,
        totalSupply: results.totalSupply.result,
        decimals: results.decimals.result,
        symbol: parseString(results.symbol.result),
      });
    });
  };
}

export function fetchTokenDetails(tokenAddress: string): () => Promise<any> {
  return (dispatch, getState, api) => {
    const contractCallBase = {to: tokenAddress};

    return Promise.all([
      api.geth.eth.call({ ...contractCallBase, data: tokenContract.functionToData('totalSupply') }),
      api.geth.eth.call({ ...contractCallBase, data: tokenContract.functionToData('decimals') }),
      api.geth.eth.call({ ...contractCallBase, data: tokenContract.functionToData('symbol') }),
    ]).then(([totalSupply, decimals, symbol]) => {
      return {
        address: tokenAddress,
        totalSupply,
        decimals,
        symbol: parseString(symbol),
      };
    });
  };
}


/**
 * Load balances of all known tokens for particular address
 *
 * @param address
 */
export function loadTokensBalances(addresses: string) {
  return (dispatch: any, getState: any, api: any) => {
    const tokens = getState().tokens.get('tokens').toJS();
    // build batch call request
    const batch = [];
    tokens.forEach((token) => addresses.forEach((addr) => {
      batch.push({
        id: `${addr}+${token.address}`,
        to: token.address,
        data: tokenContract.functionToData('balanceOf', { _owner: addr }),
      });
    }));

    return api.geth.ext.batchCall(batch).then((results) => {
      const tokenBalances = [];
      tokens.forEach((token) => addresses.forEach((addr) => {
        tokenBalances.push({
          tokenAddress: token.address,
          accountAddress: addr,
          amount: results[`${addr}+${token.address}`].result,
        });
      }));

      dispatch({
        type: ActionTypes.SET_TOKENS_BALANCES,
        tokenBalances,
      });
    });
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
      tokens.map((token) => dispatch(loadTokenDetails(token.address)));
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
      return dispatch(loadTokenDetails(token.address));
    });
  };
}

export function removeToken(address: string) {
  return (dispatch, getState, api) => dispatch({ type: ActionTypes.REMOVE_TOKEN, address });
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
