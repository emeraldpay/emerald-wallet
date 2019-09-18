import { IApi } from '@emeraldwallet/core';
import { all, call, put, takeEvery } from 'redux-saga/effects';
import { tokenContract } from './erc20';
import { ActionTypes, RequestTokenBalanceAction } from './types';

function* fetchBalanceInfo (api: IApi, action: RequestTokenBalanceAction) {
  const { token, address, chain } = action.payload;
  const data = tokenContract.functionToData('balanceOf', { _owner: address });
  const result = yield call(api.chain(chain).eth.call, { to: token.address, data });
  console.error(result);
}

function* watchRequestBalance (api: IApi) {
  yield takeEvery(ActionTypes.REQUEST_TOKEN_BALANCE, fetchBalanceInfo, api);
}

export function* root (api: IApi) {
  yield all([
    watchRequestBalance(api)
  ]);
}
