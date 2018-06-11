// @flow
import { convert } from 'emerald-js';
import BigNumber from 'bignumber.js';
import { intervalRates } from '../../store/config';
import createLogger from '../../utils/logger';
import ActionTypes from './actionTypes';
import history from '../wallet/history';

import network from './';

const log = createLogger('networkActions');

let watchingHeight = false;

export function switchChain({ chain, chainId }, dispatch) {
  dispatch({
    type: ActionTypes.SWITCH_CHAIN,
    chain,
    chainId,
  });
};

export function loadHeight(watch, dispatch, getState, api) {
  return api.geth.eth.getBlockNumber()
    .then((result) => {
      dispatch({
        type: ActionTypes.BLOCK,
        height: result,
      });
      if (watch && !watchingHeight) {
        watchingHeight = true;
        setTimeout(() => dispatch(network.actions.loadHeight(true)), intervalRates.continueLoadHeightRate);
      }
    });
}

export function loadPeerCount(dispatch, getState, api) {
  return api.geth.net.peerCount().then((result) => {
    if (getState().network.get('peerCount') !== convert.toNumber(result)) {
      dispatch({
        type: ActionTypes.PEER_COUNT,
        peerCount: result,
      });
    }
  });
}

const removeReduxProps = (props) => {
  const nonReduxProps = {...props};
  nonReduxProps.dispatch = nonReduxProps.api = nonReduxProps.getState = undefined;
  return nonReduxProps;
};

export function loadAddressTransactions(...params) {
  const [dispatch, getState, api] = params.slice(params.length - 3);
  return api.geth.eth.getAddressTransactions(...params).then((result) => {
    return api.geth.ext.getTransactions(result).then((txes) => {
      return Promise.all(txes.map((tx) => dispatch(history.actions.trackTx(tx.result))));
    });
  });
}

export function loadSyncing(dispatch, getState, api) {
  const repeat = getState().launcher.getIn(['geth', 'type']) === 'local';
  return api.geth.eth.getSyncing().then((result) => {
    if (typeof result === 'object') {
      dispatch({
        type: ActionTypes.SYNCING,
        syncing: true,
        status: result,
      });
      if (repeat) {
        setTimeout(() => dispatch(loadSyncing()), intervalRates.continueLoadSyncRate);
      }
    } else {
      dispatch({
        type: ActionTypes.SYNCING,
        syncing: false,
      });
      setTimeout(() => dispatch(network.actions.loadHeight(true)), intervalRates.continueLoadSyncRate);
    }
  });
}

export function getGasPrice(dispatch, getState, api) {
  return api.geth.eth.gasPrice().then((result) => {
    dispatch({
      type: ActionTypes.GAS_PRICE,
      value: result,
    });
  });
}

export function estimateGas(from: string, to: string, gas: string, gasPrice: string, value: string, data: string, dispatch, getState, api) {
  return api.geth.eth.estimateGas({
    from,
    to,
    gas,
    gasPrice,
    value,
    data,
  });
}
