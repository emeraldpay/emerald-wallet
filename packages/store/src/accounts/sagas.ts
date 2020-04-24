import { Account, BlockchainCode, IBackendApi, Wallet } from '@emeraldwallet/core';
import { registry } from '@emeraldwallet/erc20';
import { all, call, put, select, takeEvery, takeLatest } from '@redux-saga/core/effects';
import { ipcRenderer } from 'electron';
import { SagaIterator } from 'redux-saga';
import * as screen from '../screen';
import { requestTokensBalances } from '../tokens/actions';
import { fetchErc20BalancesAction, setLoadingAction, setWalletsAction, walletCreatedAction } from './actions';
import { allAccounts } from './selectors';
import { ActionTypes, IFetchErc20BalancesAction } from './types';

function* fetchErc20Balances (action: IFetchErc20BalancesAction): SagaIterator {
  const accounts = yield select(allAccounts);
  for (const account of accounts) {
    // TODO: account might not be Ethereum address
    const address = account.address;
    const chain = account.blockchain;

    // Look up all known tokens for current blockchain
    const _tokens = registry.all()[chain as BlockchainCode] || [];

    // Request balances for each token for current address
    yield put(requestTokensBalances(chain, _tokens, address));
  }
}

function* loadAllWallets (backendApi: IBackendApi): SagaIterator {
  yield put(setLoadingAction(true));

  const wallets: any = yield call(backendApi.getAllWallets);

  yield put(setWalletsAction(wallets));
  yield put(fetchErc20BalancesAction());
  yield put(setLoadingAction(false));

  // Subscribe to balance update from Emerald Services

  const subscribe: {[key: string]: string[]} = {};
  const accounts = yield select(allAccounts);
  // TODO: account might not be Ethereum address
  accounts.forEach((account: any) => {
    const code = account.blockchain;
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

function* createWallet (backendApi: IBackendApi, action: any): SagaIterator {
  const { walletName, password, mnemonic } = action.payload;
  const wallet = yield call(backendApi.createWallet, walletName, password, mnemonic);
  yield put(walletCreatedAction(wallet));
  yield put(screen.actions.gotoScreen(screen.Pages.WALLET, wallet.id));
}

function* afterAccountImported (backendApi: IBackendApi, action: any): SagaIterator {
  const { walletId, accountId } = action.payload;

  const wallet: Wallet = yield call(backendApi.getWallet, walletId);
  const account: Account = wallet.accounts.find((a: Account) => a.id === accountId)!;

  // subscribe for balance
  const chainCode = account.blockchain;
  ipcRenderer.send('subscribe-balance', chainCode, [account.address]);

  // fetch erc20 tokens
  const _tokens = registry.all()[chainCode] || [];
  yield put(requestTokensBalances(chainCode, _tokens, account.address!));
}

export function* root (backendApi: IBackendApi) {
  yield all([
    takeLatest(ActionTypes.FETCH_ERC20_BALANCES, fetchErc20Balances),
    takeLatest(ActionTypes.LOAD_WALLETS, loadAllWallets, backendApi),
    takeLatest(ActionTypes.CREATE_WALLET, createWallet, backendApi),
    takeEvery(ActionTypes.ACCOUNT_IMPORTED, afterAccountImported, backendApi)
  ]);

}
