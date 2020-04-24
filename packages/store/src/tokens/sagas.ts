import { convert } from '@emeraldplatform/core';
import { IBackendApi } from '@emeraldwallet/core';
import { all, call, put, takeEvery } from 'redux-saga/effects';
import { setTokenBalance } from './actions';
import { ActionTypes, IRequestTokenBalanceAction, IRequestTokensBalancesAction, ITokenBalance } from './types';

function* fetchBalanceInfo (backendApi: IBackendApi, action: IRequestTokenBalanceAction) {
  const { token, address, chain } = action.payload;
  const result = yield call(backendApi.getErc20Balance, chain, token.address, address);
  const b: ITokenBalance = {
    decimals: token.decimals,
    symbol: token.symbol,
    tokenId: token.address,
    unitsValue: convert.toBigNumber(result).toString()
  };
  yield put(setTokenBalance(chain, b, address));
}

function * fetchTokensBalances (backendApi: IBackendApi, action: IRequestTokensBalancesAction) {
  const { tokens, address, chain } = action.payload;
  for (const token of tokens) {
    const result = yield call(backendApi.getErc20Balance, chain, token.address, address);

    const b: ITokenBalance = {
      decimals: token.decimals,
      symbol: token.symbol,
      tokenId: token.address,
      unitsValue: convert.toBigNumber(result).toString()
    };
    yield put(setTokenBalance(chain, b, address));
  }
}

function* watchRequestBalance (backendApi: IBackendApi) {
  yield takeEvery(ActionTypes.REQUEST_TOKEN_BALANCE, fetchBalanceInfo, backendApi);
  yield takeEvery(ActionTypes.REQUEST_TOKENS_BALANCES, fetchTokensBalances, backendApi);
}

export function* root (backendApi: IBackendApi) {
  yield all([
    watchRequestBalance(backendApi)
  ]);
}
