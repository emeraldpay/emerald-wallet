import {ActionTypes, BlockAction, FetchGasPriceAction, GasPriceAction} from "./types";

export function setGasPriceAction(blockchainCode: string, gasPrice: string) : GasPriceAction {
  return {
    type: ActionTypes.GAS_PRICE,
    payload: { chain: blockchainCode, gasPrice: gasPrice }
  }
}

export function fetchGasPriceAction(blockchainCode: string): FetchGasPriceAction {
  return {
    type: ActionTypes.FETCH_GAS_PRICE,
    payload: blockchainCode,
  }
}

export function blockAction(payload: {hash: string, height: any, chain: any}): BlockAction {
  return {
    type: ActionTypes.BLOCK,
    payload,
  }
}
