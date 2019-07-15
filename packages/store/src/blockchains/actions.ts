import {ActionTypes, BlockAction, FetchGasPriceAction, GasPriceAction} from "./types";
import {Dispatch} from "react";
import Wei from "@emeraldplatform/eth/lib/wei";
import BigNumber from "bignumber.js";

export function setGasPriceAction(blockchainCode: string, gasPrice: Wei) : GasPriceAction {
  return {
    type: ActionTypes.GAS_PRICE,
    payload: { blockchain: blockchainCode, gasPrice: gasPrice }
  }
}

export function fetchGasPriceAction(blockchainCode: string): any {
  return (dispatch: Dispatch<GasPriceAction>, getState: Function, api: any) => {
    return api.chain(blockchainCode).eth.gasPrice().then((result: BigNumber) => {
      dispatch( setGasPriceAction(blockchainCode, new Wei(result)))
    }).catch((e: any) => console.error('Unable to load GasPrice', blockchainCode, e));
  };
}

export function blockAction(payload: {hash: string, height: any, blockchain: any}): BlockAction {
  return {
    type: ActionTypes.BLOCK,
    payload,
  }
}
