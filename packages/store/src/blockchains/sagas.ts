import { Wei } from '@emeraldplatform/eth';
import { IBackendApi } from '@emeraldwallet/core';
import { all, call, put, takeEvery } from 'redux-saga/effects';
import { setGasPriceAction } from './actions';
import { ActionTypes, IFetchGasPriceAction } from './types';

/**
 * Fetches gas price by RPC call
 */
function* fetchGasPrice (api: IBackendApi, action: IFetchGasPriceAction) {
  const result = yield call(api.getGasPrice, action.payload);
  yield put(setGasPriceAction(action.payload, new Wei(result)));
}

export function* root (api: IBackendApi) {
  yield all([
    takeEvery(ActionTypes.FETCH_GAS_PRICE, fetchGasPrice, api)
  ]);
}
