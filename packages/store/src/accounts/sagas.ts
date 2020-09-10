import {
  BlockchainCode,
  blockchainCodeToId,
  Blockchains,
  IBackendApi,
  IVault,
  blockchainIdToCode,
} from '@emeraldwallet/core';
import {registry} from '@emeraldwallet/erc20';
import { all, call, put, select, takeEvery, takeLatest } from '@redux-saga/core/effects';
import { ipcRenderer } from 'electron';
import { SagaIterator } from 'redux-saga';
import * as screen from '../screen';
import {requestTokensBalances} from '../tokens/actions';
import {
  fetchErc20BalancesAction,
  hdAccountCreated,
  setLoadingAction,
  setSeedsAction,
  setWalletsAction,
  walletCreatedAction,
} from './actions';
import {allAccounts, allWallets, findWallet} from './selectors';
import {ActionTypes, ICreateHdEntry, ICreateWalletAction, IFetchErc20BalancesAction, ISubWalletBalance} from './types';
import {AddEntry, SeedDescription, Wallet, WalletEntry} from "@emeraldpay/emerald-vault-core";

// Subscribe to balance update from Emerald Services
function* subscribeAccountBalance(accounts: WalletEntry[]): SagaIterator {
  const subscribe: Partial<Record<BlockchainCode, string[]>> = {};
  // TODO: account might not be Ethereum address
  accounts.forEach((account: WalletEntry) => {
    const code: BlockchainCode = blockchainIdToCode(account.blockchain);
    let current = subscribe[code];
    if (typeof current === 'undefined') {
      current = [];
    }
    if (account.address) {
      current.push(account.address.value);
    }
    subscribe[code] = current;
  });

  Object.keys(subscribe).forEach((blockchainCode) => {
    const addedAddresses = subscribe[blockchainCode as BlockchainCode];
    if (addedAddresses && addedAddresses.length > 0) {
      ipcRenderer.send('subscribe-balance', blockchainCode, addedAddresses);
    }
  });
}

function* fetchErc20Balances(action: IFetchErc20BalancesAction): SagaIterator {
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

  const accounts = yield select(allAccounts);
  yield call(subscribeAccountBalance, accounts);
}

function* loadSeeds(backendApi: IBackendApi): SagaIterator {
  yield put(setLoadingAction(true));

  const seeds: SeedDescription[] = yield call(backendApi.listSeeds);
  yield put(setSeedsAction(seeds));

  yield put(setLoadingAction(false));
}

function* createWallet(backendApi: IBackendApi, action: ICreateWalletAction): SagaIterator {
  const {walletName, password, mnemonic} = action.payload;
  const wallets = yield select(allWallets);
  const name = walletName ?? `Wallet ${wallets.length}`;
  const wallet = yield call(backendApi.createWallet, name, password, mnemonic);
  yield put(walletCreatedAction(wallet));
  yield put(screen.actions.gotoScreen(screen.Pages.WALLET, wallet.id));
}

/**
 * When we import account it means we create one wallet with one account
 */
function* afterAccountImported (backendApi: IBackendApi, action: any): SagaIterator {
  const { walletId } = action.payload;

  const wallet: Wallet = yield call(backendApi.getWallet, walletId);

  const account: WalletEntry = wallet.entries[0];

  // subscribe for balance
  const chainCode = blockchainIdToCode(account.blockchain);
  ipcRenderer.send('subscribe-balance', chainCode, [account.address]);

  // fetch erc20 tokens
  const _tokens = registry.all()[chainCode] || [];
  if (account.address && account.address.type == "single") {
    yield put(requestTokensBalances(chainCode, _tokens, account.address.value));
  }
}

/**
 * Create new single-address type of account, with PK from the current seed associated with the wallet
 *
 * @param vault
 * @param backendApi
 * @param action
 */
function* createHdAddress(vault: IVault, backendApi: IBackendApi, action: ICreateHdEntry): SagaIterator {
  const {walletId, blockchain, seedPassword} = action;
  const chain = Blockchains[blockchain];
  if (!chain) {
    return;
  }
  let wallet: Wallet = yield select(findWallet, walletId);

  let existing = (wallet.reserved || []).find((curr) => {
    return !(action.seedId && action.seedId != curr.seedId);
  });

  if (!existing) {
    //wallet doesn't have addresses with the seed
    console.warn("Wallet " + wallet.id + " doesn't have hd account")
    return;
  }

  try {
    const entry: AddEntry = {
      type: "hd-path",
      blockchain: blockchainCodeToId(blockchain),
      key: {
        seed: {type: "id", value: existing.seedId, password: seedPassword},
        hdPath: chain.params.hdPath.forAccount(existing.accountId).toString()
      }
    }
    const accountId = vault.addEntry(walletId, entry);

    wallet = yield call(backendApi.getWallet, walletId);
    const account = wallet.entries.find((a) => a.id === accountId)!;

    // subscribe for balance
    ipcRenderer.send('subscribe-balance', blockchain, [account.address!.value]);

    // fetch erc20 tokens
    const _tokens = registry.all()[blockchain as BlockchainCode] || [];
    yield put(requestTokensBalances(blockchain, _tokens, account.address!.value));
    yield put(hdAccountCreated(wallet.id, account));
    yield put(screen.actions.gotoScreen(screen.Pages.WALLET, wallet.id));
  } catch (error) {
    yield put(screen.actions.showError(error));
  }
}

function* loadWalletBalance(vault: IVault, backendApi: IBackendApi, action: ISubWalletBalance): SagaIterator {
  const wallet = vault.getWallet(action.walletId);
  if (typeof wallet != "object") {
    return;
  }
  yield call(subscribeAccountBalance, wallet.entries);
}

export function* root(vault: IVault, backendApi: IBackendApi) {
  yield all([
    takeLatest(ActionTypes.LOAD_SEEDS, loadSeeds, backendApi),
    takeLatest(ActionTypes.FETCH_ERC20_BALANCES, fetchErc20Balances),
    takeLatest(ActionTypes.LOAD_WALLETS, loadAllWallets, backendApi),
    takeEvery(ActionTypes.CREATE_WALLET, createWallet, backendApi),
    takeEvery(ActionTypes.ACCOUNT_IMPORTED, afterAccountImported, backendApi),
    takeEvery(ActionTypes.CREATE_HD_ACCOUNT, createHdAddress, vault, backendApi),
    takeEvery(ActionTypes.SUBSCRIBE_WALLET_BALANCE, loadWalletBalance, vault, backendApi)
  ]);
}
