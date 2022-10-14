import { AnyTokenCode, IBackendApi, toBigNumber } from '@emeraldwallet/core';
import { SagaIterator } from 'redux-saga';
import { all, call, put, takeEvery } from 'redux-saga/effects';
import { setTokenBalance } from './actions';
import { ActionTypes, RequestTokenBalanceAction, RequestTokensBalancesAction, TokenBalance } from './types';

function* fetchBalanceInfo(backendApi: IBackendApi, action: RequestTokenBalanceAction): SagaIterator {
  const { token, address, blockchain } = action.payload;

  const result = yield call(backendApi.getBalance, blockchain, address, [token.symbol as AnyTokenCode]);

  const balance: TokenBalance = {
    decimals: token.decimals,
    symbol: token.symbol as AnyTokenCode,
    tokenId: token.address,
    unitsValue: toBigNumber(result).toString(),
  };

  yield put(setTokenBalance(blockchain, balance, address));
}

function* fetchTokensBalances(backendApi: IBackendApi, action: RequestTokensBalancesAction): SagaIterator {
  const { tokens, address, blockchain } = action.payload;

  const balances = yield call(
    backendApi.getBalance,
    blockchain,
    address,
    tokens.map((t) => t.symbol),
  );

  for (const token of tokens) {
    const balance: TokenBalance = {
      decimals: token.decimals,
      symbol: token.symbol as AnyTokenCode,
      tokenId: token.address,
      unitsValue: toBigNumber(balances[token.symbol]).toString(),
    };

    yield put(setTokenBalance(blockchain, balance, address));
  }
}

export function* root(backendApi: IBackendApi): SagaIterator {
  yield all([
    takeEvery(ActionTypes.REQUEST_TOKEN_BALANCE, fetchBalanceInfo, backendApi),
    takeEvery(ActionTypes.REQUEST_TOKENS_BALANCES, fetchTokensBalances, backendApi),
  ]);
}
