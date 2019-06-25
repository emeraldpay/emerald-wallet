// @flow
import { intervalRates } from '../config';
import createLogger from '../../utils/logger';
import ActionTypes from './actionTypes';
import history from '../wallet/history';
import { screen } from '..';

export function switchChain({ chain, chainId }) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.SWITCH_CHAIN,
      chain,
      chainId,
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
    }).catch(screen.actions.dispatchRpcError(dispatch));
  };
}

export function estimateGas(chain, tx) {
  const {
    from, to, gas, gasPrice, value, data,
  } = tx;
  return (dispatch, getState, api) => {
    return api.chain(chain).eth.estimateGas({
      from,
      to,
      gas: `0x${gas.toString(16)}`,
      gasPrice: gasPrice.toHex(),
      value: value.toHex(),
      data,
    });
  };
}
