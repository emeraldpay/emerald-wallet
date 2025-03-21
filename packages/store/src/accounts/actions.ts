import {
  AddEntry,
  AddressRole,
  CurrentAddress,
  EntryId,
  ExportedWeb3Json,
  IdSeedReference,
  OddPasswordItem,
  SeedDefinition,
  SeedDescription,
  SeedDetails,
  SeedReference,
  SignedMessage,
  UnsignedMessage,
  Uuid,
  Wallet,
  WalletEntry,
  WatchEvent,
  WatchRequest,
} from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  HDPath,
  IpcCommands,
  PersistentState,
  blockchainCodeToId,
  blockchainIdToCode,
} from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import { showError } from '../screen/actions';
import { Dispatched } from '../types';
import {
  AccountBalance,
  ActionTypes,
  CreateHdEntryAction,
  CreateWalletAction,
  HdAccountCreatedAction,
  InitAccountStateAction,
  LoadSeedsAction,
  LoadWalletsAction,
  NextAddressAction,
  SetBalanceAction,
  SetLoadingAction,
  SetSeedsAction,
  SetWalletIconsAction,
  SubscribeWalletBalance,
  UpdateWalletAction,
  WalletCreatedAction,
  WalletImportedAction,
  WalletsLoadedAction,
} from './types';

export function initState(
  balances: PersistentState.Balance[],
  entriesByAddress: Record<string, WalletEntry[]>,
): InitAccountStateAction {
  return {
    type: ActionTypes.INIT_STATE,
    balances,
    entriesByAddress,
  };
}

export function setBalanceAction(balance: AccountBalance): SetBalanceAction {
  return {
    type: ActionTypes.SET_BALANCE,
    payload: [balance],
  };
}

export function setLoadingAction(loading: boolean): SetLoadingAction {
  return {
    type: ActionTypes.LOADING,
    payload: loading,
  };
}

export function loadWalletsAction(): LoadWalletsAction {
  return {
    type: ActionTypes.LOAD_WALLETS,
  };
}

export function hdAccountCreated(walletId: string, account: WalletEntry): HdAccountCreatedAction {
  return {
    type: ActionTypes.HD_ACCOUNT_CREATED,
    payload: {
      walletId,
      account,
    },
  };
}

export function setWalletsAction(wallets: Wallet[]): WalletsLoadedAction {
  return {
    type: ActionTypes.SET_LIST,
    payload: wallets,
  };
}

export function createNewWalletAction(walletName: string, password: string, mnemonic: string): CreateWalletAction {
  return {
    type: ActionTypes.CREATE_WALLET,
    payload: {
      walletName,
      password,
      mnemonic,
    },
  };
}

export function importSeedWalletAction(mnemonic: string, password: string): CreateWalletAction {
  return {
    type: ActionTypes.CREATE_WALLET,
    payload: {
      password,
      mnemonic,
    },
  };
}

export function walletCreatedAction(wallet: Wallet): WalletCreatedAction {
  ipcRenderer.send(IpcCommands.UPDATE_MAIN_MENU);

  return {
    type: ActionTypes.CREATE_WALLET_SUCCESS,
    wallet,
  };
}

export function accountImportedAction(walletId: string): Dispatched<void, WalletImportedAction> {
  return (dispatch, getState) => {
    const {
      application: { tokens },
    } = getState();

    dispatch({
      type: ActionTypes.ACCOUNT_IMPORTED,
      payload: {
        tokens,
        walletId,
      },
    });
  };
}

export function createHdAccountAction(
  walletId: string,
  blockchain: BlockchainCode,
  seedPassword?: string,
): CreateHdEntryAction {
  return {
    type: ActionTypes.CREATE_HD_ACCOUNT,
    blockchain,
    seedPassword,
    walletId,
  };
}

export type CreateWalletOptions = {
  label?: string;
  entry?: AddEntry;
};

export function createWallet(
  options: CreateWalletOptions,
  entries: AddEntry[],
  handler: (wallet?: Wallet, err?: Error) => void,
): Dispatched<void, WalletCreatedAction> {
  return async (dispatch, getState, { api: { vault } }) => {
    try {
      const walletId = await vault.addWallet(options.label);

      for (const entry of entries) {
        await vault.addEntry(walletId, entry);
      }

      const wallet = await vault.getWallet(walletId);

      if (wallet != null) {
        for (const { address, blockchain, id } of wallet.entries) {
          if (address != null) {
            await ipcRenderer.invoke(IpcCommands.TXS_SUBSCRIBE, address.value, blockchainIdToCode(blockchain), id);
          }
        }

        dispatch(walletCreatedAction(wallet));
      }

      handler(wallet);
    } catch (error) {
      if (error instanceof Error) {
        handler(undefined, error);
      }
    }
  };
}

export function exportPrivateKey(passphrase: string, accountId: EntryId): Dispatched<string> {
  return (dispatch, getState, extra) => extra.api.vault.exportRawPk(accountId, passphrase);
}

export function exportKeyFile(accountId: EntryId, password: string): Dispatched<ExportedWeb3Json> {
  return (dispatch, getState, extra) => extra.api.vault.exportJsonPk(accountId, password);
}

export function updateWallet(walletId: Uuid, name: string): Dispatched<void, UpdateWalletAction> {
  return async (dispatch, getState, extra) => {
    const result = await extra.api.vault.setWalletLabel(walletId, name);

    ipcRenderer.send(IpcCommands.UPDATE_MAIN_MENU);

    if (result) {
      dispatch({
        type: ActionTypes.WALLET_UPDATED,
        payload: {
          walletId,
          name,
        },
      });
    }
  };
}

export function importPk(blockchain: BlockchainCode, pk: string, password: string): Dispatched<string> {
  return async (dispatch, getState, { api: { vault } }) => {
    const walletId = await vault.addWallet();

    await vault.addEntry(walletId, {
      type: 'raw-pk-hex',
      blockchain: blockchainCodeToId(blockchain),
      key: pk,
      password,
    });

    const wallet = await vault.getWallet(walletId);

    if (wallet) {
      // update redux store with new wallet
      dispatch(walletCreatedAction(wallet));
      dispatch(accountImportedAction(walletId));
    }

    return Promise.resolve(walletId);
  };
}

export function generateMnemonic(handler?: (value: string) => void): Dispatched {
  return (dispatch, getState, extra) => {
    extra.api.vault.generateMnemonic(24).then(handler).catch(showError);
  };
}

export function loadSeedsAction(): LoadSeedsAction {
  return {
    type: ActionTypes.LOAD_SEEDS,
  };
}

export function setSeedsAction(seeds: SeedDescription[]): SetSeedsAction {
  return {
    type: ActionTypes.SET_SEEDS,
    payload: seeds,
  };
}

export function createSeed(seed: SeedDefinition, handler: (id: Uuid) => void): Dispatched {
  return (dispatch, getState, extra) => {
    extra.api.vault.importSeed(seed).then(handler).catch(showError);
  };
}

export function subscribeWalletBalance(walletId: Uuid): SubscribeWalletBalance {
  return {
    type: ActionTypes.SUBSCRIBE_WALLET_BALANCE,
    walletId,
  };
}

export function unlockSeed(seedId: Uuid, password: string, handler: (valid: boolean) => void): Dispatched {
  return (dispatch, getState, extra) => {
    const seed: IdSeedReference = {
      type: 'id',
      value: seedId,
      password,
    };

    // TODO always generate new random?
    const hdpath = "m/44'/15167'/8173'/68/164";

    extra.api.vault
      .listSeedAddresses(seed, 100, [hdpath])
      .then((addresses) => handler(typeof addresses[hdpath] == 'string' && addresses[hdpath].length > 0))
      .catch(() => handler(false));
  };
}

export function nextAddress(entryId: EntryId, role: AddressRole): NextAddressAction {
  return {
    type: ActionTypes.NEXT_ADDRESS,
    entryId,
    addressRole: role,
  };
}

export function isGlobalKeySet(): Dispatched<boolean> {
  return (dispatch, getState, extra) => extra.api.vault.isGlobalKeySet();
}

export function getOddPasswordItems(): Dispatched<OddPasswordItem[]> {
  return (dispatch, getState, extra) => extra.api.vault.getOddPasswordItems();
}

export function createGlobalKey(password: string): Dispatched<boolean> {
  return (dispatch, getState, extra) => extra.api.vault.createGlobalKey(password);
}

export function tryUpgradeOddItems(oddPassword: string, globalPassword: string): Dispatched<Uuid[]> {
  return (dispatch, getState, extra) => extra.api.vault.tryUpgradeOddItems(oddPassword, globalPassword);
}

export function verifyGlobalKey(password: string): Dispatched<boolean> {
  return (dispatch, getState, extra) => extra.api.vault.verifyGlobalKey(password);
}

export function changeGlobalKey(oldPassword: string, newPassword: string): Dispatched<boolean> {
  return (dispatch, getState, extra) => extra.api.vault.changeGlobalKey(oldPassword, newPassword);
}

export function addEntryToWallet(walletId: Uuid, entry: AddEntry): Dispatched<string> {
  return (dispatch, getState, extra) => extra.api.vault.addEntry(walletId, entry);
}

export function listEntryAddresses(
  entryId: EntryId,
  role: AddressRole,
  start: number,
  limit: number,
): Dispatched<CurrentAddress[]> {
  return (dispatch, getState, extra) => extra.api.vault.listEntryAddresses(entryId, role, start, limit);
}

export function listSeedAddresses(
  seed: Uuid | SeedReference | SeedDefinition,
  blockchain: number,
  hdPaths: string[],
): Dispatched<{ [hdPath: string]: string }> {
  return (dispatch, getState, extra) => extra.api.vault.listSeedAddresses(seed, blockchain, hdPaths);
}

export function disableReceiveForEntry(entryId: EntryId, disabled = true): Dispatched<boolean> {
  return (dispatch, getState, extra) => extra.api.vault.setEntryReceiveDisabled(entryId, disabled);
}

export function getXPubPosition(xPub: string): Dispatched<number> {
  return (dispatch, getState, extra) => extra.api.xPubPos.getNext(xPub);
}

export function getAllXPubAddresses(entryId: EntryId, xPub: string, role: AddressRole): Dispatched<CurrentAddress[]> {
  return async (dispatch, getState, extra) => {
    const position = await extra.api.xPubPos.getNext(xPub);
    const addresses = await extra.api.vault.listEntryAddresses(entryId, role, 0, position + 1);

    return addresses.map((address, index) => ({
      ...address,
      hdPath: address.hdPath == null ? '' : HDPath.parse(address.hdPath).forIndex(index).toString(),
    }));
  };
}

export function getXPubPositionalAddress(
  entryId: EntryId,
  xPub: string,
  role: AddressRole,
): Dispatched<CurrentAddress> {
  return async (dispatch, getState, extra) => {
    const position = await extra.api.xPubPos.getNext(xPub);
    const [address] = await extra.api.vault.listEntryAddresses(entryId, role, position, 1);

    return {
      ...address,
      hdPath: address.hdPath == null ? '' : HDPath.parse(address.hdPath).forIndex(position).toString(),
    };
  };
}

export function updateSeed(seed: Uuid | IdSeedReference, details: Partial<SeedDetails>): Dispatched<boolean> {
  return (dispatch, getState, extra) => extra.api.vault.updateSeed(seed, details);
}

export function signMessage(entryId: EntryId, message: UnsignedMessage, password?: string): Dispatched<SignedMessage> {
  return (dispatch, getState, extra) => extra.api.vault.signMessage(entryId, message, password);
}

export function setWalletIcons(icons: Record<string, string | null>): SetWalletIconsAction {
  return {
    type: ActionTypes.SET_WALLET_ICONS,
    icons,
  };
}

export function getWalletIcon(id: Uuid): Dispatched<ArrayBuffer | null> {
  return (dispatch, getState, extra) => extra.api.vault.getIcon(id);
}

export function setWalletIcon(id: Uuid, icon: Uint8Array | null): Dispatched<boolean> {
  return async (dispatch, getState, extra) => {
    const result = await extra.api.vault.setIcon(id, icon);

    if (result) {
      const content = await extra.api.vault.getIcon(id);

      const {
        accounts: { icons },
      } = getState();

      dispatch(setWalletIcons({ ...icons, [id]: content == null ? null : Buffer.from(content).toString('base64') }));
    }

    return result;
  };
}

export function watchHardwareConnection(request: WatchRequest): Dispatched<WatchEvent> {
  return (dispatch, getState, extra) => extra.api.vault.watch(request);
}
