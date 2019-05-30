import {takeEvery, put, call} from 'redux-saga/effects';
import {IApi} from "@emeraldwallet/core";
import {ActionTypes, FetchGasPriceAction} from "./types";
import {setGasPriceAction} from "./actions";

/**
 * Fetches gas price by RPC call
 */
function* fetchGasPrice(api: IApi, action: FetchGasPriceAction) {
  const result = yield call(api.chain(action.payload)!.eth.gasPrice);
  yield put(setGasPriceAction(action.payload, result.toString()));
}

/**
 * This saga watches state for gas price request for blockchain
 */
export function *watchRequestGasPrice(api: IApi) {
  yield takeEvery(ActionTypes.FETCH_GAS_PRICE, fetchGasPrice, api);
}
