import {ActionTypes, BlockAction, FetchGasPriceAction, GasPriceAction} from "./types";
import {Wei} from "@emeraldplatform/eth";

export function setGasPriceAction(blockchainCode: string, gasPrice: Wei) : GasPriceAction {
  return {
    type: ActionTypes.GAS_PRICE,
    payload: { blockchain: blockchainCode, gasPrice: gasPrice }
  }
}

export function fetchGasPriceAction(blockchainCode: string): FetchGasPriceAction {
  return {
    type: ActionTypes.FETCH_GAS_PRICE,
    payload: blockchainCode,
  }
}

export function blockAction(payload: {hash: string, height: any, blockchain: any}): BlockAction {
  return {
    type: ActionTypes.BLOCK,
    payload,
  }
}
