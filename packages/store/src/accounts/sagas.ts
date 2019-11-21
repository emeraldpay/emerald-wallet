import { IApi } from '@emeraldwallet/core';
import { call, put, select, takeLatest } from '@redux-saga/core/effects';
import { all } from './selectors';
import { ActionTypes, AddressList, AddressMap, IFetchHdPathsAction } from './types';

function* fetchHdPaths (api: IApi, action: IFetchHdPathsAction) {
  const accounts: AddressList = yield select(all);
  const hwAccounts: AddressMap[] = accounts.filter((a: any) => a.get('hardware', true)).toArray();
  for (const item of hwAccounts) {
    const address = item.get('id');
    const chain = item.get('blockchain').toLowerCase();
    const result = yield call(api.emerald.exportAccount, address, chain);

    yield put({
      type: ActionTypes.SET_HD_PATH,
      accountId: address,
      hdpath: result.crypto.hd_path,
      blockchain: chain
    });
  }
}

export function* root (api: IApi) {
  yield takeLatest(ActionTypes.FETCH_HD_PATHS, fetchHdPaths, api);
}
