import { IApi } from '@emeraldwallet/core';
import { LedgerApi } from '@emeraldwallet/ledger';
import { remote } from 'electron';
import { all, call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { selectAddressAction, setHdOffsetAction, start, updateAddressAction } from './actions';
import { getHdBase } from './selectors';
import { ActionTypes, IGetAddressesAction, LoadAddrInfoAction } from './types';

function* fetchAddrInfo (api: IApi, action: LoadAddrInfoAction) {
  yield;
}

function* getAddressesSaga (api: IApi, action: IGetAddressesAction) {
  const { offset, count } = action;
  yield put(setHdOffsetAction(offset));
  yield put(selectAddressAction(undefined));

  const basePath = yield select(getHdBase);
  const dpaths: string[] = [];
  for (let i = 0; i < count; i++) {
    const hdpath = [basePath, i + offset].join('/');
    yield put(start(i, hdpath));
    dpaths.push(hdpath);
  }

  // call ledger to get addresses by derivation paths
  const ledgerApi: LedgerApi = remote.getGlobal('ledger');
  const result = yield call(ledgerApi.getAddresses, dpaths);
  for (const path of dpaths) {
    yield put(updateAddressAction(path, result[path]));
    // TODO: consider batch request for all addresses
    // return dispatch(loadInfo(chain, hdpath, addr.address));

  }
}

function* watchLoadInfo (api: IApi) {
  yield takeEvery(ActionTypes.LOAD_ADDR_INFO, fetchAddrInfo, api);
}

function* watchGetAddresses (api: IApi) {
  yield takeLatest(ActionTypes.GET_ADDRESSES, getAddressesSaga, api);
}

export function* root (api: IApi) {
  yield all([
    watchLoadInfo(api),
    watchGetAddresses(api)
  ]);
}
