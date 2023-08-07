import {
  AddEntry,
  BitcoinEntry,
  HDPathAccount,
  IEmeraldVault,
  SeedDescription,
  Wallet,
  WalletEntry,
  isBitcoinEntry,
  isEthereumEntry,
} from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  Blockchains,
  IpcCommands,
  PersistentState,
  blockchainCodeToId,
  blockchainIdToCode,
} from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import { SagaIterator } from 'redux-saga';
import { all, call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { accounts } from '../index';
import * as screen from '../screen';
import { hdAccountCreated, setLoadingAction, setSeedsAction, setWalletsAction } from './actions';
import { allEntries, findWallet } from './selectors';
import {
  ActionTypes,
  CreateHdEntryAction,
  NextAddressAction,
  SubscribeWalletBalance,
  WalletImportedAction,
} from './types';

function subscribeAccountBalance(entries: WalletEntry[]): void {
  entries.forEach((entry) => {
    const blockchainCode = blockchainIdToCode(entry.blockchain);
    const { coin } = Blockchains[blockchainCode].params;

    if (isEthereumEntry(entry)) {
      const { value: address } = entry.address ?? {};

      if (address != null) {
        ipcRenderer
          .invoke(IpcCommands.BALANCE_SUBSCRIBE, entry.id, blockchainCode, address, coin)
          .catch((error) =>
            console.warn(`Can't subscribe to balance for ${address} on ${blockchainCode} blockchain`, error),
          );
      }
    } else if (isBitcoinEntry(entry)) {
      entry.xpub.forEach((xpub) =>
        ipcRenderer
          .invoke(IpcCommands.BALANCE_SUBSCRIBE, entry.id, blockchainCode, xpub.xpub, coin)
          .catch((error) =>
            console.warn(`Can't subscribe to balance for ${xpub.xpub} on ${blockchainCode} blockchain`, error),
          ),
      );
    } else {
      console.warn('Invalid entry', entry);
    }
  });
}

function subscribeAccountTokens(entries: WalletEntry[]): void {
  entries.forEach((entry) => {
    const blockchainCode = blockchainIdToCode(entry.blockchain);

    if (isEthereumEntry(entry)) {
      const { value: address } = entry.address ?? {};

      if (address != null) {
        ipcRenderer
          .invoke(IpcCommands.ALLOWANCE_SUBSCRIBE_ADDRESS, entry.id, blockchainCode, address)
          .catch((error) =>
            console.warn(`Can't subscribe to allowance for ${address} on ${blockchainCode} blockchain`, error),
          );

        ipcRenderer
          .invoke(IpcCommands.TOKENS_SUBSCRIBE_ADDRESS, entry.id, blockchainCode, address)
          .catch((error) =>
            console.warn(`Can't subscribe to tokens for ${address} on ${blockchainCode} blockchain`, error),
          );
      }
    } else if (!isBitcoinEntry(entry)) {
      console.warn('Invalid entry', entry);
    }
  });
}

/**
 * When we import account it means we create one wallet with one account
 */
function* afterAccountImported(vault: IEmeraldVault, action: WalletImportedAction): SagaIterator {
  const { walletId } = action.payload;

  const wallet: Wallet = yield call(vault.getWallet, walletId);

  const [{ address, blockchain, id: entryId }] = wallet.entries;
  const { code, coin } = Blockchains[blockchain].params;

  if (address != null) {
    const { value: addressValue } = address;

    ipcRenderer
      .invoke(IpcCommands.ALLOWANCE_SUBSCRIBE_ADDRESS, entryId, coin, addressValue)
      .catch((error) => console.warn(`Can't subscribe to allowance for ${addressValue} on ${code} blockchain`, error));

    ipcRenderer
      .invoke(IpcCommands.BALANCE_SUBSCRIBE, entryId, code, addressValue, coin)
      .catch((error) => console.warn(`Can't subscribe to balance for ${addressValue} on ${code} blockchain`, error));

    ipcRenderer
      .invoke(IpcCommands.TOKENS_SUBSCRIBE_ADDRESS, entryId, code, addressValue)
      .catch((error) => console.warn(`Can't subscribe to tokens for ${addressValue} on ${code} blockchain`, error));
  }
}

/**
 * Create new single-address type of account, with PK from the current seed associated with the wallet
 */
function* createHdAddress(vault: IEmeraldVault, action: CreateHdEntryAction): SagaIterator {
  const { walletId, blockchain, seedId } = action;

  const chain = Blockchains[blockchain];

  if (chain == null) {
    console.error(`Incorrect blockchain provided ${blockchain}`);

    return;
  }

  let wallet: Wallet = yield select(findWallet, walletId);

  if (wallet == null) {
    console.error(`Wallet ${walletId} not found`);

    return;
  }

  let hdPathAccount: HDPathAccount | undefined;

  if (seedId == null) {
    [hdPathAccount] = wallet.reserved ?? [];
  } else {
    hdPathAccount = wallet.reserved?.find(({ seedId: accountSeedId }) => accountSeedId === seedId);
  }

  if (hdPathAccount == null) {
    console.error(`Wallet ${walletId} doesn't have HD account`);

    return;
  }

  const { seedId: accountSeedId } = hdPathAccount;

  const blockchainId = blockchainCodeToId(blockchain);
  const hdPath = chain.params.hdPath.forAccount(hdPathAccount.accountId).toString();

  const seeds: SeedDescription[] = yield call(vault.listSeeds);

  const accountSeedType = seeds.find(({ id }) => id === accountSeedId)?.type;

  let address: string | undefined;

  if (accountSeedType === 'ledger') {
    try {
      ({ [hdPath]: address } = yield call(vault.listSeedAddresses, accountSeedId, blockchainId, [hdPath]));

      if (address == null) {
        console.error(`Can't find address for seed ${accountSeedId}`);

        return;
      }
    } catch (exception) {
      console.error(`Error while getting address for seed ${accountSeedId}:`, exception);

      return;
    }
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
          password: action.seedPassword,
          value: accountSeedId,
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
        const { coin } = Blockchains[shadowBlockchain].params;

        ipcRenderer
          .invoke(IpcCommands.ALLOWANCE_SUBSCRIBE_ADDRESS, shadowEntryId, shadowBlockchain, shadowAddress)
          .catch((error) =>
            console.warn(`Can't subscribe to allowance for ${shadowAddress} on ${shadowBlockchain} blockchain`, error),
          );

        ipcRenderer
          .invoke(IpcCommands.BALANCE_SUBSCRIBE, shadowEntryId, shadowBlockchain, shadowAddress, coin)
          .catch((error) =>
            console.warn(`Can't subscribe to balance for ${shadowAddress} on ${blockchain} blockchain`, error),
          );

        ipcRenderer
          .invoke(IpcCommands.TOKENS_SUBSCRIBE_ADDRESS, shadowEntryId, shadowBlockchain, shadowAddress)
          .catch((error) =>
            console.warn(`Can't subscribe to tokens for ${shadowAddress} on ${blockchain} blockchain`, error),
          );

        yield put(hdAccountCreated(walletId, shadowEntry));
      }
    }

    const { value: entryAddress } = entry.address;
    const { coin } = Blockchains[blockchain].params;

    ipcRenderer
      .invoke(IpcCommands.ALLOWANCE_SUBSCRIBE_ADDRESS, entry.id, blockchain, entryAddress)
      .catch((error) =>
        console.warn(`Can't subscribe to tokens for ${entryAddress} on ${blockchain} blockchain`, error),
      );

    ipcRenderer
      .invoke(IpcCommands.BALANCE_SUBSCRIBE, entry.id, blockchain, entryAddress, coin)
      .catch((error) =>
        console.warn(`Can't subscribe to balance for ${entryAddress} on ${blockchain} blockchain`, error),
      );

    ipcRenderer
      .invoke(IpcCommands.TOKENS_SUBSCRIBE_ADDRESS, entry.id, blockchain, entryAddress)
      .catch((error) =>
        console.warn(`Can't subscribe to tokens for ${entryAddress} on ${blockchain} blockchain`, error),
      );

    yield put(hdAccountCreated(walletId, entry));

    yield put(screen.actions.gotoScreen(screen.Pages.WALLET, walletId));
  } catch (error) {
    if (error instanceof Error) {
      yield put(screen.actions.showError(error));
    }
  }
}

function* nextAddress(xPubPos: PersistentState.XPubPosition, action: NextAddressAction): SagaIterator {
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

function* loadWalletBalance(vault: IEmeraldVault, action: SubscribeWalletBalance): SagaIterator {
  const wallet = yield call(vault.getWallet, action.walletId);

  if (typeof wallet != 'object') {
    return;
  }

  yield call(subscribeAccountBalance, wallet.entries);
  yield call(subscribeAccountTokens, wallet.entries);
}

function* loadSeeds(vault: IEmeraldVault): SagaIterator {
  const seeds: SeedDescription[] = yield call(vault.listSeeds);

  yield put(setSeedsAction(seeds));
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

  const accounts = yield select(allEntries);

  yield call(subscribeAccountBalance, accounts);
  yield call(subscribeAccountTokens, accounts);
}

export function* root(vault: IEmeraldVault, xPubPos: PersistentState.XPubPosition): SagaIterator {
  yield all([
    takeEvery(ActionTypes.ACCOUNT_IMPORTED, afterAccountImported, vault),
    takeEvery(ActionTypes.CREATE_HD_ACCOUNT, createHdAddress, vault),
    takeEvery(ActionTypes.NEXT_ADDRESS, nextAddress, xPubPos),
    takeEvery(ActionTypes.SUBSCRIBE_WALLET_BALANCE, loadWalletBalance, vault),
    takeLatest(ActionTypes.LOAD_SEEDS, loadSeeds, vault),
    takeLatest(ActionTypes.LOAD_WALLETS, loadAllWallets, vault),
  ]);
}
