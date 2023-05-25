import {
  AddEntry,
  HDPathAccount,
  IEmeraldVault,
  SeedDescription,
  Wallet,
  WalletEntry,
} from '@emeraldpay/emerald-vault-core';
import { BitcoinEntry, isBitcoinEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core/lib/types';
import {
  BlockchainCode,
  Blockchains,
  IpcCommands,
  PersistentState,
  TokenRegistry,
  blockchainCodeToId,
  blockchainIdToCode,
} from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import { Action } from 'redux';
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
import {
  ActionTypes,
  ICreateHdEntry,
  IFetchErc20BalancesAction,
  INextAddress,
  ISubWalletBalance,
  IWalletImportedAction,
} from './types';

function subscribeAccountBalance(entries: WalletEntry[]): void {
  entries.forEach((entry) => {
    const blockchainCode = blockchainIdToCode(entry.blockchain);

    if (isEthereumEntry(entry)) {
      ipcRenderer.send(IpcCommands.BALANCE_SUBSCRIBE, blockchainCode, entry.id, entry.address?.value);
    } else if (isBitcoinEntry(entry)) {
      entry.xpub.forEach((xpub) =>
        ipcRenderer.send(IpcCommands.BALANCE_SUBSCRIBE, blockchainCode, entry.id, xpub.xpub),
      );
    } else {
      console.warn('Invalid entry', entry);
    }
  });
}

function* fetchErc20Balances(action: IFetchErc20BalancesAction): SagaIterator {
  const entries: WalletEntry[] = yield select(allEntries);

  const etherAccounts = entries.filter((entry: WalletEntry) => isEthereumEntry(entry));

  const tokenRegistry = new TokenRegistry(action.tokens);

  for (const { address, blockchain } of etherAccounts) {
    if (address != null) {
      const blockchainCode = blockchainIdToCode(blockchain);
      const tokens = tokenRegistry.byBlockchain(blockchainCode);

      yield put(requestTokensBalances(blockchainCode, tokens, address.value));
    }
  }
}

function* loadAllWallets(vault: IEmeraldVault): SagaIterator {
  let wallets: Wallet[] = yield call(vault.listWallets);

  wallets = wallets
    .map((wallet) => ({
      ...wallet,
      entries: wallet.entries.filter((entry) => {
        try {
          return typeof blockchainIdToCode(entry.blockchain) === 'string';
        } catch (exception) {
          return false;
        }
      }),
    }))
    .sort((first, second) => {
      if (first.createdAt === second.createdAt) {
        return 0;
      }

      return first.createdAt > second.createdAt ? 1 : -1;
    });

  yield put(setWalletsAction(wallets));
  yield put(setLoadingAction(false));

  // Saga doesn't support thunk action, so we make conversion to unknown type and then to Action type
  yield put(fetchErc20BalancesAction() as unknown as Action);

  const accounts = yield select(allEntries);

  yield call(subscribeAccountBalance, accounts);
}

function* loadSeeds(vault: IEmeraldVault): SagaIterator {
  const seeds: SeedDescription[] = yield call(vault.listSeeds);

  yield put(setSeedsAction(seeds));
}

/**
 * When we import account it means we create one wallet with one account
 */
function* afterAccountImported(vault: IEmeraldVault, action: IWalletImportedAction): SagaIterator {
  const { walletId } = action.payload;

  const wallet: Wallet = yield call(vault.getWallet, walletId);

  const account: WalletEntry = wallet.entries[0];

  const chainCode = blockchainIdToCode(account.blockchain);

  ipcRenderer.send(IpcCommands.BALANCE_SUBSCRIBE, chainCode, account.id, account.address?.value);

  const tokenRegistry = new TokenRegistry(action.payload.tokens);

  const tokens = tokenRegistry.byBlockchain(chainCode);

  if (account.address && account.address.type == 'single') {
    yield put(requestTokensBalances(chainCode, tokens, account.address.value));
  }
}

/**
 * Create new single-address type of account, with PK from the current seed associated with the wallet
 */
function* createHdAddress(vault: IEmeraldVault, action: ICreateHdEntry): SagaIterator {
  const { walletId, blockchain, seedId, seedPassword } = action;

  const chain = Blockchains[blockchain];

  if (chain == null) {
    console.error(`Incorrect blockchain provided ${blockchain}`);

    return;
  }

  let wallet: Wallet = yield select(findWallet, walletId);

  let existingAccount: HDPathAccount | undefined;

  if (seedId == null) {
    [existingAccount] = wallet.reserved ?? [];
  } else {
    existingAccount = wallet.reserved?.find(({ seedId: accountSeedId }) => accountSeedId === seedId);
  }

  if (existingAccount == null) {
    console.error(`Wallet ${walletId} doesn't have HD account`);

    return;
  }

  const { seedId: existedSeedId } = existingAccount;

  const blockchainId = blockchainCodeToId(blockchain);
  const hdPath = chain.params.hdPath.forAccount(existingAccount.accountId).toString();

  const { [hdPath]: address } = yield call(vault.listSeedAddresses, existedSeedId, blockchainId, [hdPath]);

  if (address == null) {
    console.error(`Cannot find address for seed ${existedSeedId}`);

    return;
  }

  try {
    const addEntry: AddEntry = {
      type: 'hd-path',
      blockchain: blockchainId,
      key: {
        address,
        hdPath: hdPath,
        seed: {
          type: 'id',
          password: seedPassword,
          value: existedSeedId,
        },
      },
    };

    const entryId = yield call(vault.addEntry, walletId, addEntry);

    wallet = yield call(vault.getWallet, walletId);

    const entry = wallet.entries.find(({ id }) => id === entryId);

    if (entry?.address?.value == null) {
      console.error(`Entry doesn't contain address`);

      return;
    }

    const tokenRegistry = new TokenRegistry(action.tokens);

    if (blockchain === BlockchainCode.ETC || blockchain === BlockchainCode.ETH) {
      const shadowBlockchain = blockchain === BlockchainCode.ETH ? BlockchainCode.ETC : BlockchainCode.ETH;

      const addShadowEntry = {
        ...addEntry,
        blockchain: blockchainCodeToId(shadowBlockchain),
      };

      const shadowEntryId = yield call(vault.addEntry, walletId, addShadowEntry);

      yield call(vault.setEntryReceiveDisabled, shadowEntryId, true);

      wallet = yield call(vault.getWallet, walletId);

      const shadowEntry = wallet.entries.find(({ id }) => id === shadowEntryId);

      if (shadowEntry?.address?.value != null) {
        const { value: shadowAddress } = shadowEntry.address;

        ipcRenderer.send(IpcCommands.BALANCE_SUBSCRIBE, shadowBlockchain, shadowEntryId, [shadowAddress]);

        const tokens = tokenRegistry.byBlockchain(shadowBlockchain);

        yield put(requestTokensBalances(shadowBlockchain, tokens, shadowAddress));
        yield put(hdAccountCreated(walletId, shadowEntry));
      }
    }

    const { value: entryAddress } = entry.address;

    ipcRenderer.send(IpcCommands.BALANCE_SUBSCRIBE, blockchain, entry.id, [entryAddress]);

    const tokens = tokenRegistry.byBlockchain(blockchain);

    yield put(requestTokensBalances(blockchain, tokens, entryAddress));
    yield put(hdAccountCreated(walletId, entry));

    yield put(screen.actions.gotoScreen(screen.Pages.WALLET, walletId));
  } catch (error) {
    if (error instanceof Error) {
      yield put(screen.actions.showError(error));
    }
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
    const position: number = yield call(xPubPos.getNext, xpub);

    yield call(xPubPos.setCurrentAddressAt, xpub, position);
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
