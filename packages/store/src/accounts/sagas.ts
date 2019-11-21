import { BlockchainCode, IApi } from '@emeraldwallet/core';
import { registry } from '@emeraldwallet/erc20';
import { call, put, select, takeLatest } from '@redux-saga/core/effects';
import { SagaIterator } from 'redux-saga';
import { requestTokenBalance } from '../tokens/actions';
import { all, allAsArray } from './selectors';
import { ActionTypes, AddressList, AddressMap, IFetchErc20BalancesAction, IFetchHdPathsAction } from './types';

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

function* fetchErc20Balances (api: IApi, action: IFetchErc20BalancesAction): SagaIterator {
  const accounts: AddressMap[] = yield select(allAsArray);
  for (const acc of accounts) {
    const address = acc.get('id');
    const chain = acc.get('blockchain').toLowerCase();

    // Look up all known tokens for current blockchain
    const _tokens = registry.all()[chain as BlockchainCode];

    // Request balance for each token for current address
    for (const t of _tokens) {
      yield put(requestTokenBalance(chain, t, address));
    }
  }
}

export function* root (api: IApi) {
  yield takeLatest(ActionTypes.FETCH_HD_PATHS, fetchHdPaths, api);
  yield takeLatest(ActionTypes.FETCH_ERC20_BALANCES, fetchErc20Balances, api);
}
