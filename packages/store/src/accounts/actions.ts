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
} from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, HDPath, IpcCommands, blockchainCodeToId, blockchainIdToCode } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import {
  ActionTypes,
  IBalanceUpdate,
  ICreateHdEntry,
  ICreateWalletAction,
  IFetchErc20BalancesAction,
  IHdAccountCreated,
  ILoadSeedsAction,
  ILoadWalletsAction,
  INextAddress,
  ISetBalanceAction,
  ISetLoadingAction,
  ISetSeedsAction,
  ISubWalletBalance,
  IUpdateWalletAction,
  IWalletCreatedAction,
  IWalletImportedAction,
  IWalletsLoaded,
} from './types';
import { dispatchRpcError } from '../screen/actions';
import { Dispatched } from '../types';

export function setBalanceAction(balance: IBalanceUpdate): ISetBalanceAction {
  return {
    type: ActionTypes.SET_BALANCE,
    payload: balance,
  };
}

export function setLoadingAction(loading: boolean): ISetLoadingAction {
  return {
    type: ActionTypes.LOADING,
    payload: loading,
  };
}

export function fetchErc20BalancesAction(): Dispatched<void, IFetchErc20BalancesAction> {
  return (dispatch, getState) => {
    const {
      application: { tokens },
    } = getState();

    dispatch({
      type: ActionTypes.FETCH_ERC20_BALANCES,
      tokens,
    });
  };
}

export function loadWalletsAction(): ILoadWalletsAction {
  return {
    type: ActionTypes.LOAD_WALLETS,
  };
}

export function hdAccountCreated(walletId: string, account: WalletEntry): IHdAccountCreated {
  return {
    type: ActionTypes.HD_ACCOUNT_CREATED,
    payload: {
      walletId,
      account,
    },
  };
}

export function setWalletsAction(wallets: Wallet[]): IWalletsLoaded {
  return {
    type: ActionTypes.SET_LIST,
    payload: wallets,
  };
}

export function loadAccountBalance(entryId: EntryId, blockchain: BlockchainCode, address: string): void {
  ipcRenderer.send(IpcCommands.BALANCE_SUBSCRIBE, blockchain, entryId, [address]);
}

export function createNewWalletAction(walletName: string, password: string, mnemonic: string): ICreateWalletAction {
  return {
    type: ActionTypes.CREATE_WALLET,
    payload: {
      walletName,
      password,
      mnemonic,
    },
  };
}

export function importSeedWalletAction(mnemonic: string, password: string): ICreateWalletAction {
  return {
    type: ActionTypes.CREATE_WALLET,
    payload: {
      password,
      mnemonic,
    },
  };
}

export function walletCreatedAction(wallet: Wallet): IWalletCreatedAction {
  return {
    type: ActionTypes.CREATE_WALLET_SUCCESS,
    wallet,
  };
}

export function accountImportedAction(walletId: string): Dispatched<void, IWalletImportedAction> {
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
  seedPassword: string,
): Dispatched<void, ICreateHdEntry> {
  return (dispatch, getState) => {
    const {
      application: { tokens },
    } = getState();

    dispatch({
      type: ActionTypes.CREATE_HD_ACCOUNT,
      blockchain,
      seedPassword,
      tokens,
      walletId,
    });
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
): Dispatched<void, IWalletCreatedAction> {
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

export function updateWallet(walletId: Uuid, name: string): Dispatched<void, IUpdateWalletAction> {
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
    extra.api.vault.generateMnemonic(24).then(handler).catch(dispatchRpcError(dispatch));
  };
}

export function loadSeedsAction(): ILoadSeedsAction {
  return {
    type: ActionTypes.LOAD_SEEDS,
  };
}

export function setSeedsAction(seeds: SeedDescription[]): ISetSeedsAction {
  return {
    type: ActionTypes.SET_SEEDS,
    payload: seeds,
  };
}

export function createSeed(seed: SeedDefinition, handler: (id: Uuid) => void): Dispatched {
  return (dispatch, getState, extra) => {
    extra.api.vault.importSeed(seed).then(handler).catch(dispatchRpcError(dispatch));
  };
}

export function subscribeWalletBalance(walletId: Uuid): ISubWalletBalance {
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

export function nextAddress(entryId: EntryId, role: AddressRole): INextAddress {
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

export function addEntryToWallet(walletId: Uuid, entry: AddEntry): Dispatched<ILoadWalletsAction> {
  return (dispatch, getState, extra) =>
    extra.api.vault.addEntry(walletId, entry).then(() => dispatch(loadWalletsAction()));
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

export function getAllXPubAddresses(entryId: string, xPub: string, role: AddressRole): Dispatched<CurrentAddress[]> {
  return async (dispatch, getState, extra) => {
    const position = await extra.api.xPubPos.getNext(xPub);
    const addresses = await extra.api.vault.listEntryAddresses(entryId, role, 0, position + 1);

    return addresses.map((address, index) => ({
      ...address,
      hdPath: address.hdPath == null ? '' : HDPath.parse(address.hdPath).forIndex(index).toString(),
    }));
  };
}

export function getXPubPositionalAddress(entryId: string, xPub: string, role: AddressRole): Dispatched<CurrentAddress> {
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

export function signMessage(entryId: string, message: UnsignedMessage, password?: string): Dispatched<SignedMessage> {
  return (dispatch, getState, extra) => extra.api.vault.signMessage(entryId, message, password);
}
