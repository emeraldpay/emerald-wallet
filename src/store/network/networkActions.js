// @flow
import { convert } from 'emerald-js';
import BigNumber from 'bignumber.js';
import { intervalRates } from '../../store/config';
import createLogger from '../../utils/logger';
import ActionTypes from './actionTypes';
import history from '../wallet/history';

const log = createLogger('networkActions');

const handleFailedToFetch = (err) => {
  if (err.message.includes('Failed to fetch')) { return; }
  throw err;
};

export function switchChain({ chain, chainId }) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.SWITCH_CHAIN,
      chain,
      chainId,
    });
  };
}

export function loadHeight(watch) {
  return (dispatch, getState, api) => {
    return api.geth.eth.getBlockNumber().then((result) => {
      dispatch({
        type: ActionTypes.BLOCK,
        height: result,
      });
    }).catch(handleFailedToFetch);
  };
}

export function loadPeerCount() {
  return (dispatch, getState, api) => {
    return api.geth.net.peerCount().then((result) => {
      dispatch({
        type: ActionTypes.PEER_COUNT,
        peerCount: result,
      });
    }).catch(handleFailedToFetch);
  };
}

export function loadAddressesTransactions(addresses) {
  return (dispatch, getState, api) => {
    const addressTransactionPromises = addresses.map((address) => {
      return api.geth.eth.getAddressTransactions(address, 0, 0, 'tf', 'sc', -1, -1, false);
    }).toJS();

    Promise.all(addressTransactionPromises).then((transactionsByAccount) => {
      const results = transactionsByAccount.reduce((m, r) => m.concat(r), []);
      const uniqueTransactions = Array.from(new Set(results));
      if (results.length === 0) { return; }

      const trackedTxs = getState().wallet.history.get('trackedTransactions');
      const untrackedResults = uniqueTransactions.filter((txHash) => {
        const isAlreadyTracked = !trackedTxs.find((tx) => txHash === tx.get('hash'));
        return isAlreadyTracked;
      });

      if (untrackedResults.length === 0) { return; }

      return api.geth.ext.getTransactions(untrackedResults).then((txes) => {
        return dispatch(history.actions.trackTxs(txes.map((tx) => tx.result)));
      });
    });
  };
}

export function loadSyncing() {
  return (dispatch, getState, api) => {
    return api.geth.eth.getSyncing().then((result) => {
      if (typeof result === 'object') {
        return dispatch({
          type: ActionTypes.SYNCING,
          syncing: true,
          status: result,
        });
      }

      dispatch({
        type: ActionTypes.SYNCING,
        syncing: false,
      });
    }).catch(handleFailedToFetch);
  };
}

export function getGasPrice() {
  return (dispatch, getState, api) => {
    return api.geth.eth.gasPrice().then((result) => {
      dispatch({
        type: ActionTypes.GAS_PRICE,
        value: result,
      });
    }).catch(handleFailedToFetch);
  };
}

export function estimateGas(from: string, to: string, gas: string, gasPrice: string, value: string, data: string) {
  return (dispatch, getState, api) => {
    return api.geth.eth.estimateGas({
      from,
      to,
      gas,
      gasPrice,
      value,
      data,
    });
  };
}
