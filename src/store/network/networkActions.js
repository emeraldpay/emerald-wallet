// @flow
import { convert } from 'emerald-js';
import BigNumber from 'bignumber.js';
import { intervalRates } from '../../store/config';
import createLogger from '../../utils/logger';
import ActionTypes from './actionTypes';
import history from '../wallet/history';

const log = createLogger('networkActions');

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
    });
  };
}

export function loadPeerCount() {
  return (dispatch, getState, api) => {
    return api.geth.net.peerCount().then((result) => {
      dispatch({
        type: ActionTypes.PEER_COUNT,
        peerCount: result,
      });
    });
  };
}

export function loadAddressTransactions(...props) {
  return (dispatch, getState, api) => {
    return api.geth.eth.getAddressTransactions(...props).then((result) => {
      return api.geth.ext.getTransactions(result).then((txes) => {
        return Promise.all(txes.map((tx) => dispatch(history.actions.trackTx(tx.result))));
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
    });
  };
}

export function getGasPrice() {
  return (dispatch, getState, api) => {
    return api.geth.eth.gasPrice().then((result) => {
      dispatch({
        type: ActionTypes.GAS_PRICE,
        value: result,
      });
    });
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
