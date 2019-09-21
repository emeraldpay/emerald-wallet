import { Wei } from '@emeraldplatform/eth';
import { IApi } from '@emeraldwallet/core';
import { call, put, takeEvery } from 'redux-saga/effects';
import { setGasPriceAction } from './actions';
import { ActionTypes, FetchGasPriceAction } from './types';

/**
 * Fetches gas price by RPC call
 */
function* fetchGasPrice (api: IApi, action: FetchGasPriceAction) {
  const result = yield call(api.chain(action.payload)!.eth.gasPrice);
  yield put(setGasPriceAction(action.payload, new Wei(result)));
}

/**
 * This saga watches state for gas price request for blockchain
 */
export function *watchRequestGasPrice (api: IApi) {
  yield takeEvery(ActionTypes.FETCH_GAS_PRICE, fetchGasPrice, api);
}

export function* root (api: IApi) {
  yield watchRequestGasPrice(api);
}
