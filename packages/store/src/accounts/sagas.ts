import { WalletsOp } from '@emeraldpay/emerald-vault-core';
import { blockchainById, BlockchainCode, IApi, WalletService } from '@emeraldwallet/core';
import { registry } from '@emeraldwallet/erc20';
import { call, put, select, takeLatest } from '@redux-saga/core/effects';
import { ipcRenderer } from 'electron';
import { SagaIterator } from 'redux-saga';
import { requestTokenBalance } from '../tokens/actions';
import { fetchErc20BalancesAction, setListAction, setLoadingAction } from './actions';
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

function* loadAllWallets (api: IApi): SagaIterator {
  yield put(setLoadingAction(true));

  const service = new WalletService(api.vault);
  const wallets = yield call(service.getAllWallets);

  yield put(setListAction(wallets));
  yield put(fetchErc20BalancesAction());

  yield put(setLoadingAction(false));

  const subscribe: {[key: string]: string[]} = {};
  // TODO: fix bug for kovan
  WalletsOp.of(wallets)
    .getAccounts()
    .forEach((account) => {
      const code = blockchainById(account.blockchain)!.params.code;
      let current = subscribe[code];
      if (typeof current === 'undefined') {
        current = [];
      }
      current.push(account.address);
      subscribe[code] = current;
    });

  Object.keys(subscribe).forEach((blockchainCode) => {
    const addedAddresses = subscribe[blockchainCode];
    ipcRenderer.send('subscribe-balance', blockchainCode, addedAddresses);
  });
}

export function* root (api: IApi) {
  yield takeLatest(ActionTypes.FETCH_ERC20_BALANCES, fetchErc20Balances, api);
  yield takeLatest(ActionTypes.LOAD_WALLETS, loadAllWallets, api);
}
