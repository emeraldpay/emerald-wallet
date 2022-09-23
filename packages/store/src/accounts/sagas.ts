import { AddEntry, IEmeraldVault, SeedDescription, Wallet, WalletEntry } from '@emeraldpay/emerald-vault-core';
import { BitcoinEntry, isBitcoinEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core/lib/types';
import {
  BlockchainCode,
  blockchainCodeToId,
  blockchainIdToCode,
  Blockchains,
  PersistentState,
} from '@emeraldwallet/core';
import { registry } from '@emeraldwallet/erc20';
import { ipcRenderer } from 'electron';
import { SagaIterator } from 'redux-saga';
import { all, call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { accounts } from '../index';
import * as screen from '../screen';
import { requestTokensBalances } from '../tokens/actions';
import {
  fetchErc20BalancesAction,
  hdAccountCreated,
  setLoadingAction,
  setSeedsAction,
  setWalletsAction,
} from './actions';
import { allEntries, findWallet } from './selectors';
import { ActionTypes, ICreateHdEntry, INextAddress, ISubWalletBalance } from './types';

// Subscribe to balance update from Emerald Services
function subscribeAccountBalance(accounts: WalletEntry[]): void {
  accounts.forEach((account: WalletEntry) => {
    const code: BlockchainCode = blockchainIdToCode(account.blockchain);

    if (isEthereumEntry(account)) {
      ipcRenderer.send('subscribe-balance', code, account.id, account.address?.value);
    } else if (isBitcoinEntry(account)) {
      account.xpub.forEach((xpub) => {
        ipcRenderer.send('subscribe-balance', code, account.id, xpub.xpub);
      });
    } else {
      console.log('Invalid entry', account);
    }
  });
}

function* fetchErc20Balances(): SagaIterator {
  const accounts = yield select(allEntries);

  const etherAccounts = accounts.filter((account: WalletEntry) => isEthereumEntry(account));

  for (const account of etherAccounts) {
    const {
      address: { value: address },
      blockchain,
    } = account;

    const chain = blockchainIdToCode(blockchain);

    // Look up all known tokens for current blockchain
    const tokens = registry.all()[chain] ?? [];

    // Request balances for each token for current address
    yield put(requestTokensBalances(chain, tokens, address));
  }
}

function* loadAllWallets(vault: IEmeraldVault): SagaIterator {
  yield put(setLoadingAction(true));

  const wallets: Wallet[] = yield call(vault.listWallets);

  yield put(setWalletsAction(wallets));
  yield put(fetchErc20BalancesAction());
  yield put(setLoadingAction(false));

  const accounts = yield select(allEntries);
  yield call(subscribeAccountBalance, accounts);
}

function* loadSeeds(vault: IEmeraldVault): SagaIterator {
  yield put(setLoadingAction(true));

  const seeds: SeedDescription[] = yield call(vault.listSeeds);
  yield put(setSeedsAction(seeds));

  yield put(setLoadingAction(false));
}

/**
 * When we import account it means we create one wallet with one account
 */
function* afterAccountImported(vault: IEmeraldVault, action: any): SagaIterator {
  const { walletId } = action.payload;

  const wallet: Wallet = yield call(vault.getWallet, walletId);

  const account: WalletEntry = wallet.entries[0];

  // subscribe for balance
  const chainCode = blockchainIdToCode(account.blockchain);
  ipcRenderer.send('subscribe-balance', chainCode, account.id, account.address?.value);

  // fetch erc20 tokens
  const _tokens = registry.all()[chainCode] || [];
  if (account.address && account.address.type == 'single') {
    yield put(requestTokensBalances(chainCode, _tokens, account.address.value));
  }
}

/**
 * Create new single-address type of account, with PK from the current seed associated with the wallet
 *
 * @param vault
 * @param action
 */
function* createHdAddress(vault: IEmeraldVault, action: ICreateHdEntry): SagaIterator {
  const { walletId, blockchain, seedPassword } = action;
  const chain = Blockchains[blockchain];
  if (!chain) {
    return;
  }
  let wallet: Wallet = yield select(findWallet, walletId);

  const existingHDAccount = (wallet.reserved || []).find((curr) => {
    return !(action.seedId && action.seedId != curr.seedId);
  });

  if (!existingHDAccount) {
    //wallet doesn't have addresses with the seed
    console.warn('Wallet ' + wallet.id + " doesn't have hd account");
    return;
  }

  try {
    const entry: AddEntry = {
      type: 'hd-path',
      blockchain: blockchainCodeToId(blockchain),
      key: {
        seed: { type: 'id', value: existingHDAccount.seedId, password: seedPassword },
        hdPath: chain.params.hdPath.forAccount(existingHDAccount.accountId).toString(),
      },
    };
    const accountId = yield call(vault.addEntry, walletId, entry);

    wallet = yield call(vault.getWallet, walletId);
    const account = wallet.entries.find((a) => a.id === accountId)!;

    // subscribe for balance
    ipcRenderer.send('subscribe-balance', blockchain, account.id, [account.address!.value]);

    // fetch erc20 tokens
    const _tokens = registry.all()[blockchain as BlockchainCode] || [];
    yield put(requestTokensBalances(blockchain, _tokens, account.address!.value));
    yield put(hdAccountCreated(wallet.id, account));
    yield put(screen.actions.gotoScreen(screen.Pages.WALLET, wallet.id));
  } catch (error) {
    yield put(screen.actions.showError(error));
  }
}

function* loadWalletBalance(vault: IEmeraldVault, action: ISubWalletBalance): SagaIterator {
  const wallet = yield call(vault.getWallet, action.walletId);
  if (typeof wallet != 'object') {
    return;
  }
  yield call(subscribeAccountBalance, wallet.entries);
}

function* nextAddress(xPubPos: PersistentState.XPubPosition, action: INextAddress): SagaIterator {
  const entries: WalletEntry[] = yield select(allEntries);

  const entry = entries
    .filter((entry): entry is BitcoinEntry => isBitcoinEntry(entry))
    .find((entry) => entry.id === action.entryId);

  const roleXPub = (entry?.xpub ?? []).filter(({ role }) => role === action.addressRole);

  for (const { xpub } of roleXPub) {
    const pos: number = yield call(xPubPos.getNext, xpub);

    yield call(xPubPos.setNextAddressAtLeast, xpub, pos);
  }

  yield put(accounts.actions.loadWalletsAction());
}

export function* root(vault: IEmeraldVault, xPubPos: PersistentState.XPubPosition): SagaIterator {
  yield all([
    takeLatest(ActionTypes.LOAD_SEEDS, loadSeeds, vault),
    takeLatest(ActionTypes.FETCH_ERC20_BALANCES, fetchErc20Balances),
    takeLatest(ActionTypes.LOAD_WALLETS, loadAllWallets, vault),
    takeEvery(ActionTypes.ACCOUNT_IMPORTED, afterAccountImported, vault),
    takeEvery(ActionTypes.CREATE_HD_ACCOUNT, createHdAddress, vault),
    takeEvery(ActionTypes.SUBSCRIBE_WALLET_BALANCE, loadWalletBalance, vault),
    takeEvery(ActionTypes.NEXT_ADDRESS, nextAddress, xPubPos),
  ]);
}
