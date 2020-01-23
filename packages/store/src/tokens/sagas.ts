import { convert } from '@emeraldplatform/core';
import { IApi } from '@emeraldwallet/core';
import { all, call, put, takeEvery } from 'redux-saga/effects';
import { setTokenBalance } from './actions';
import { tokenContract } from './erc20';
import { ActionTypes, IRequestTokenBalanceAction, IRequestTokensBalancesAction, ITokenBalance } from './types';

function* fetchBalanceInfo (api: IApi, action: IRequestTokenBalanceAction) {
  const { token, address, chain } = action.payload;
  // Call Erc20 contract to request balance for address
  const data = tokenContract.functionToData('balanceOf', { _owner: address });
  const result = yield call(api.chain(chain).eth.call, { to: token.address, data });
  const b: ITokenBalance = {
    decimals: token.decimals,
    symbol: token.symbol,
    tokenId: token.address,
    unitsValue: convert.toBigNumber(result).toString()
  };
  yield put(setTokenBalance(chain, b, address));
}

function * fetchTokensBalances (api: IApi, action: IRequestTokensBalancesAction) {
  const { tokens, address, chain } = action.payload;
  for (const token of tokens) {
    // Call Erc20 contract to request balance for address
    const data = tokenContract.functionToData('balanceOf', { _owner: address });
    const result = yield call(api.chain(chain).eth.call, { to: token.address, data });
    const b: ITokenBalance = {
      decimals: token.decimals,
      symbol: token.symbol,
      tokenId: token.address,
      unitsValue: convert.toBigNumber(result).toString()
    };
    yield put(setTokenBalance(chain, b, address));
  }
}

function* watchRequestBalance (api: IApi) {
  yield takeEvery(ActionTypes.REQUEST_TOKEN_BALANCE, fetchBalanceInfo, api);
  yield takeEvery(ActionTypes.REQUEST_TOKENS_BALANCES, fetchTokensBalances, api);
}

export function* root (api: IApi) {
  yield all([
    watchRequestBalance(api)
  ]);
}
