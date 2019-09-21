import { Wei } from '@emeraldplatform/eth';
import { IApi } from '@emeraldwallet/core';
import { ActionTypes, BlockAction, FetchGasPriceAction, GasPriceAction } from './types';

export function setGasPriceAction (blockchainCode: string, gasPrice: Wei): GasPriceAction {
  return {
    payload: { blockchain: blockchainCode, gasPrice },
    type: ActionTypes.GAS_PRICE
  };
}

export function fetchGasPriceAction (blockchainCode: string): FetchGasPriceAction {
  return {
    payload: blockchainCode,
    type: ActionTypes.FETCH_GAS_PRICE
  };
}

export function blockAction (payload: {hash: string, height: any, blockchain: any}): BlockAction {
  return {
    payload,
    type: ActionTypes.BLOCK
  };
}

export function estimateGas (chain: any, tx: {gas: any; to: string}) {
  const {
    to, gas
  } = tx;
  return (dispatch: any, getState: any, api: IApi) => {
    return api.chain(chain).eth.estimateGas({
      gas: gas.toNumber(),
      to
    });
  };
}
