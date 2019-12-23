// @flow
import { Contract } from '@emeraldplatform/contracts';
import { abi as TokenAbi } from '@emeraldwallet/erc20';
import { parseString } from '../../../lib/convert';
// import { detect as detectTraceCall } from '../../../lib/traceCall';
import ActionTypes from './actionTypes';
import createLogger from '../../../utils/logger';
import { screen } from '../..';

const { dispatchRpcError } = screen.actions;

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

export function reset() {
  return {
    type: ActionTypes.RESET,
  };
}

/**
 * Load balance of particular token for particular account
 */
export function loadTokenBalanceOf(chain, token: TokenInfo, accountId: string) {
  return (dispatch: any, getState: any, api: any) => {
    if (token.address) {
      const data = tokenContract.functionToData('balanceOf', { _owner: accountId });
      return api.chain(chain).eth.call(token.address, data).then((result) => {
        dispatch({
          type: ActionTypes.SET_TOKEN_BALANCE,
          accountId,
          token,
          value: result,
        });
      }).catch(dispatchRpcError(dispatch));
    }
    throw new Error(`Invalid token info ${JSON.stringify(token)}`);
  };
}

/**
 * For every account load balance of particular token
 */
export function loadTokenBalances(chain: string, token: TokenInfo) {
  return (dispatch, getState, api) => {
    const { accounts } = getState();
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

      return api.chain(chain).ext.batchCall(batch).then((results: Array<any>) => {
        accounts.get('accounts').forEach((acct) => {
          dispatch({
            type: ActionTypes.SET_TOKEN_BALANCE,
            accountId: acct.get('id'),
            value: results[acct.get('id')].result,
            token,
          });
        });
      }).catch(dispatchRpcError(dispatch));
    }
  };
}

export function loadTokenDetails(chain: string, tokenAddress: string): () => Promise<any> {
  return (dispatch, getState, api) => {
    const batch = [
      { id: 'totalSupply', to: tokenAddress, data: tokenContract.functionToData('totalSupply') },
      { id: 'decimals', to: tokenAddress, data: tokenContract.functionToData('decimals') },
      { id: 'symbol', to: tokenAddress, data: tokenContract.functionToData('symbol') },
    ];

    return api.chain(chain).ext.batchCall(batch).then((results: Array<any>) => {
      dispatch({
        type: ActionTypes.SET_INFO,
        address: tokenAddress,
        totalSupply: results.totalSupply.result,
        decimals: results.decimals.result,
        symbol: parseString(results.symbol.result),
      });
    }).catch(dispatchRpcError(dispatch));
  };
}

/**
 * Load balances of all known tokens for particular address
 *
 * @param chain
 * @param addresses
 */
export function loadTokensBalances(chain: string, addresses: string[]) {
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

    return api.chain(chain).ext.batchCall(batch).then((results) => {
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
    }).catch(dispatchRpcError(dispatch));
  };
}

/**
 * Load ERC20 contracts from Emerald Vault, gets token details from smart contract
 */
export function loadTokenList(chain) {
  return (dispatch, getState, api) => {
    dispatch({
      type: ActionTypes.LOADING,
    });
    //TODO remove
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
      tokens.map((token) => dispatch(loadTokenDetails(chain, token.address)));
    });
  };
}
