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

export function loadAddressTransactions(...props) {
  return (dispatch, getState, api) => {
    return api.geth.eth.getAddressTransactions(...props).then((results) => {
      if (results.length === 0) { return; }

      const trackedTxs = getState().wallet.history.get('trackedTransactions');
      const isAlreadyTracked = trackedTxs.find((tx) => results.indexOf(tx.get('hash')) !== -1);
      if (isAlreadyTracked) { return null; }

      return api.geth.ext.getTransactions(results).then((txes) => {
        return dispatch(history.actions.trackTxs(txes.map((tx) => tx.result)));
      });
    }).catch((e) => {
      log.error(e);
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
