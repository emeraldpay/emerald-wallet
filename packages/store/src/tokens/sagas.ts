import { BackendApi, PersistentState, blockchainCodeToId, toBigNumber } from '@emeraldwallet/core';
import { SagaIterator } from 'redux-saga';
import { all, call, put, takeEvery } from 'redux-saga/effects';
import { setTokenBalance } from './actions';
import { ActionTypes, RequestTokenBalanceAction, RequestTokensBalancesAction, TokenBalance } from './types';

function* fetchBalanceInfo(
  backendApi: BackendApi,
  balances: PersistentState.Balances,
  action: RequestTokenBalanceAction,
): SagaIterator {
  const { token, address, blockchain } = action.payload;

  const result = yield call(backendApi.getBalance, blockchain, address, [token.symbol]);

  const balance: TokenBalance = {
    decimals: token.decimals,
    symbol: token.symbol,
    tokenId: token.address,
    unitsValue: toBigNumber(result).toString(),
  };

  yield call(balances.set, {
    address,
    amount: balance.unitsValue,
    asset: balance.symbol,
    blockchain: blockchainCodeToId(blockchain),
  });

  yield put(setTokenBalance(blockchain, balance, address));
}

function* fetchTokensBalances(
  backendApi: BackendApi,
  balances: PersistentState.Balances,
  action: RequestTokensBalancesAction,
): SagaIterator {
  const { address, blockchain, tokens } = action.payload;

  const balanceByToken = yield call(
    backendApi.getBalance,
    blockchain,
    address,
    tokens.map(({ symbol }) => symbol),
  );

  for (const token of tokens) {
    const balance: TokenBalance = {
      decimals: token.decimals,
      symbol: token.symbol,
      tokenId: token.address,
      unitsValue: toBigNumber(balanceByToken[token.symbol]).toString(),
    };

    yield call(balances.set, {
      address,
      amount: balance.unitsValue,
      asset: balance.symbol,
      blockchain: blockchainCodeToId(blockchain),
    });

    yield put(setTokenBalance(blockchain, balance, address));
  }
}

export function* root(backendApi: BackendApi, balances: PersistentState.Balances): SagaIterator {
  yield all([
    takeEvery(ActionTypes.REQUEST_TOKEN_BALANCE, fetchBalanceInfo, backendApi, balances),
    takeEvery(ActionTypes.REQUEST_TOKENS_BALANCES, fetchTokensBalances, backendApi, balances),
  ]);
}
