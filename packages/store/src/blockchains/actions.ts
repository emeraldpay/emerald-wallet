import { Wei } from '@emeraldplatform/eth';
import { ActionTypes, IBlockAction, IFetchGasPriceAction, IGasPriceAction } from './types';

export function setGasPriceAction (blockchainCode: string, gasPrice: Wei): IGasPriceAction {
  return {
    payload: {
      blockchain: blockchainCode,
      gasPrice
    },
    type: ActionTypes.GAS_PRICE
  };
}

export function fetchGasPriceAction (blockchainCode: string): IFetchGasPriceAction {
  return {
    payload: blockchainCode,
    type: ActionTypes.FETCH_GAS_PRICE
  };
}

export function blockAction (payload: {hash: string, height: any, blockchain: any}): IBlockAction {
  return {
    payload,
    type: ActionTypes.BLOCK
  };
}
