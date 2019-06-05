import {ActionTypes, FetchGasPriceAction, GasPriceAction} from "./types";

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
