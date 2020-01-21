import { WalletsOp } from '@emeraldpay/emerald-vault-core';
import { blockchainById, BlockchainCode, IApi } from '@emeraldwallet/core';
import { registry } from '@emeraldwallet/erc20';
import { call, put, select, takeLatest } from '@redux-saga/core/effects';
import { SagaIterator } from 'redux-saga';
import { requestTokenBalance } from '../tokens/actions';
import { all } from './selectors';
import { ActionTypes, IFetchErc20BalancesAction } from './types';

function* fetchErc20Balances (api: IApi, action: IFetchErc20BalancesAction): SagaIterator {
  const wallets: WalletsOp = yield select(all);
  for (const account of wallets.getAccounts()) {
    const address = account.address;
    const chain = blockchainById(account.blockchain)!.params.code;

    // Look up all known tokens for current blockchain
    const _tokens = registry.all()[chain as BlockchainCode];

    // Request balance for each token for current address
    for (const t of _tokens) {
      yield put(requestTokenBalance(chain, t, address));
    }
  }
}

export function* root (api: IApi) {
  yield takeLatest(ActionTypes.FETCH_ERC20_BALANCES, fetchErc20Balances, api);
}
