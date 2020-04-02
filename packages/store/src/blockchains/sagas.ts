import { Wei } from '@emeraldplatform/eth';
import { IBackendApi } from '@emeraldwallet/core';
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { setGasPriceAction } from './actions';
import { ActionTypes, IFetchGasPriceAction } from './types';

/**
 * Fetches gas price by RPC call
 */
function* fetchGasPrice (api: IBackendApi, action: IFetchGasPriceAction) {
  const result = yield call(api.getGasPrice, action.payload);
  yield put(setGasPriceAction(action.payload, new Wei(result)));
}

/**
 * This saga watches state for gas price request for blockchain
 */
export function *watchRequestGasPrice (api: IBackendApi) {
  yield takeEvery(ActionTypes.FETCH_GAS_PRICE, fetchGasPrice, api);
}

export function* root (api: IBackendApi) {
  yield watchRequestGasPrice(api);
}
