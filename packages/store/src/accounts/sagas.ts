import { EthereumAccount, WalletAccount } from '@emeraldpay/emerald-vault-core';
import { blockchainById, BlockchainCode, IApi, IBackendApi, WalletService } from '@emeraldwallet/core';
import { registry } from '@emeraldwallet/erc20';
import { all, call, put, select, takeEvery, takeLatest } from '@redux-saga/core/effects';
import { ipcRenderer } from 'electron';
import { SagaIterator } from 'redux-saga';
import * as screen from '../screen';
import { requestTokensBalances } from '../tokens/actions';
import { fetchErc20BalancesAction, setLoadingAction, setWalletsAction, walletCreatedAction } from './actions';
import { allAccounts } from './selectors';
import { ActionTypes, IFetchErc20BalancesAction } from './types';

function* fetchErc20Balances (api: IApi, action: IFetchErc20BalancesAction): SagaIterator {
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

function* loadAllWallets (api: IApi): SagaIterator {
  yield put(setLoadingAction(true));

  const service = new WalletService(api.vault);
  const wallets: any = yield call(service.getAllWallets);

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

function* createWallet (api: IApi, action: any): SagaIterator {
  const name = action.payload;
  const service = new WalletService(api.vault);
  const wallet = yield call(service.createNewWallet, name);
  yield put(walletCreatedAction(wallet));
  yield put(screen.actions.gotoScreen(screen.Pages.WALLET, wallet.id));
}

function* afterAccountImported (api: IApi, backendApi: IBackendApi, action: any): SagaIterator {
  const { walletId, accountId } = action.payload;

  const service = new WalletService(api.vault);

  const wallet = yield call(service.getWallet, walletId);
  const account: WalletAccount = wallet.accounts.find((a: WalletAccount) => a.id === accountId);

  // subscribe for balance
  const chainCode = blockchainById(account.blockchain)!.params.code;
  const ethAcc = account as EthereumAccount;
  ipcRenderer.send('subscribe-balance', chainCode, [ethAcc.address]);

  // fetch erc20 tokens
  const _tokens = registry.all()[chainCode] || [];
  yield put(requestTokensBalances(chainCode, _tokens, ethAcc.address));
}

export function* root (api: IApi, backendApi: IBackendApi) {
  yield all([
    takeLatest(ActionTypes.FETCH_ERC20_BALANCES, fetchErc20Balances, api),
    takeLatest(ActionTypes.LOAD_WALLETS, loadAllWallets, api),
    takeLatest(ActionTypes.CREATE_WALLET, createWallet, api),
    takeEvery(ActionTypes.ACCOUNT_IMPORTED, afterAccountImported, api, backendApi)
  ]);

}
