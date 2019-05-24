import {takeEvery, put} from 'redux-saga/effects';
import {ActionTypes, FetchGasPriceAction} from "./types";
import {setGasPriceAction} from "./actions";

function* fetchGasPrice(action: FetchGasPriceAction) {
  yield put(setGasPriceAction(action.payload, 11388));
}

export function *gasPriceSaga() {
  yield takeEvery(ActionTypes.FETCH_GAS_PRICE, fetchGasPrice);
}
