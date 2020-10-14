import {
  blockchainByName,
  BlockchainCode,
  blockchainCodeToId,
  blockchains,
  IApi,
  IBackendApi,
  Logger,
} from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import { Dispatch } from 'redux';
import { dispatchRpcError } from '../screen/actions';
import * as history from '../txhistory';
import { Dispatched, IExtraArgument } from '../types';
import * as selectors from './selectors';
import {
  AccountsAction,
  ActionTypes, IBalanceUpdate, ICreateHdEntry,
  ICreateWalletAction,
  IFetchErc20BalancesAction,
  IHdAccountCreated, ILoadSeedsAction,
  ILoadWalletsAction, INextAddress,
  ISetBalanceAction,
  ISetLoadingAction, ISetSeedsAction,
  ISetTxCountAction, ISubWalletBalance,
  IUpdateWalletAction,
  IWalletCreatedAction,
  IWalletsLoaded, PendingBalanceAction
} from './types';
import {
  AddEntry, IdSeedReference,
  SeedDefinition,
  SeedDescription,
  SeedEntry,
  SeedReference,
  Uuid,
  WalletEntry,
  Wallet,
  EntryId
} from "@emeraldpay/emerald-vault-core";
import {AddressRole} from "@emeraldpay/emerald-vault-core/lib/types";

const log = Logger.forCategory('store.accounts');

export function setBalanceAction(balance: IBalanceUpdate): ISetBalanceAction {
  return {
    type: ActionTypes.SET_BALANCE,
    payload: balance
  };
}

export function setLoadingAction (loading: boolean): ISetLoadingAction {
  return {
    type: ActionTypes.LOADING,
    payload: loading
  };
}

export function fetchErc20BalancesAction (): IFetchErc20BalancesAction {
  return {
    type: ActionTypes.FETCH_ERC20_BALANCES
  };
}

export function loadWalletsAction (): ILoadWalletsAction {
  return {
    type: ActionTypes.LOAD_WALLETS
  };
}

export function hdAccountCreated(walletId: string, account: WalletEntry): IHdAccountCreated {
  return {
    type: ActionTypes.HD_ACCOUNT_CREATED,
    payload: {
      walletId,
      account
    }
  };
}

export function setWalletsAction (wallets: Wallet[]): IWalletsLoaded {
  return {
    type: ActionTypes.SET_LIST,
    payload: wallets
  };
}

export function loadAccountBalance(entryId: EntryId, blockchain: BlockchainCode, address: string) {
  ipcRenderer.send('subscribe-balance', blockchain, entryId, [address]);
}

// export function loadAccountTxCount (walletId: string): Dispatched<SetTxCountAction> {
//   return (dispatch, getState, api) => {
//     selectors.all(getState()).getAccounts().forEach((acc) => {
//       const blockchainCode = blockchainById(acc.blockchain)!.params.code;
//       api.chain(blockchainCode).eth.getTransactionCount(acc.address)
//         .then((result: number) => {
//           dispatch({
//             type: ActionTypes.SET_TXCOUNT,
//             accountId: acc.id,
//             value: result
//           });
//         }).catch(dispatchRpcError(dispatch));
//     });
//   };
// }

export function createNewWalletAction (walletName: string, password: string, mnemonic: string): ICreateWalletAction {
  return {
    type: ActionTypes.CREATE_WALLET,
    payload: {
      walletName,
      password,
      mnemonic
    }
  };
}

export function importSeedWalletAction (mnemonic: string, password: string): ICreateWalletAction {
  return {
    type: ActionTypes.CREATE_WALLET,
    payload: {
      password,
      mnemonic
    }
  };
}

function createWalletWithAccount(
  api: IApi,
  dispatch: Dispatch<any>,
  blockchain: BlockchainCode,
  walletName: string = '',
  add: AddEntry
): Promise<{ walletId: Uuid, accountId: string }> {

  return api.vault.addWallet(walletName)
    .then((walletId) =>
      api.vault.addEntry(walletId, add)
        .then((accountId) => {
          return {walletId, accountId}
        })
    )
    .then((result) =>
      api.vault.getWallet(result.walletId)
        .then((wallet) => {
          if (wallet) {
            dispatch(walletCreatedAction(wallet));
            dispatch(accountImportedAction(wallet.id));
          }
          return result
        })
    )
}

export function walletCreatedAction(wallet: Wallet): IWalletCreatedAction {
  return {
    type: ActionTypes.CREATE_WALLET_SUCCESS,
    wallet
  };
}

export function accountImportedAction (walletId: string) {
  return {
    type: ActionTypes.ACCOUNT_IMPORTED,
    payload: {
      walletId
    }
  };
}

export function createHdAccountAction(walletId: string,
                                      blockchain: BlockchainCode,
                                      seedPassword: string): ICreateHdEntry {
  return {
    type: ActionTypes.CREATE_HD_ACCOUNT,
    walletId,
    blockchain,
    seedPassword
  };
}

export function createAccount (
  blockchain: BlockchainCode,
  passphrase: string,
  name: string = ''
): Dispatched<IWalletCreatedAction> {
  return (dispatch: any, getState, extra) => {

    const addRequest: AddEntry = {
      blockchain: blockchainCodeToId(blockchain),
      type: 'generate-random',
      password: passphrase
    };

    return createWalletWithAccount(extra.api, dispatch, blockchain, name, addRequest)
  };
}

export type CreateWalletOptions = {
  label?: string,
  entry?: AddEntry
}

export function createWallet(options: CreateWalletOptions,
                             entries: AddEntry[],
                             handler: (walletId?: string, err?: any) => void): Dispatched<IWalletCreatedAction> {
  return async (dispatch, getState, extra) => {
    const vault = extra.api.vault;
    try {
      const walletId = await vault.addWallet(options.label);
      for (let i = 0; i < entries.length; i++) {
        let entry = entries[i];
        await vault.addEntry(walletId, entry);
      }
      const wallet = await vault.getWallet(walletId);
      if (wallet) {
        dispatch(walletCreatedAction(wallet));
      }
      handler(walletId);
    } catch (e) {
      handler(undefined, e)
    }
  }
}

export function exportPrivateKey(passphrase: string, accountId: EntryId): any {
  return (dispatch: any, getState: any, extra: IExtraArgument) => {
    return extra.api.vault.exportRawPk(accountId, passphrase);
  };
}

export function exportKeyFile(accountId: EntryId): any {
  return (dispatch: any, getState: any, extra: IExtraArgument) => {
    return extra.api.vault.exportJsonPk(accountId);
  };
}

export function updateWallet(
  walletId: Uuid, name: string
): Dispatched<IUpdateWalletAction> {
  return async (dispatch: any, getState, extra) => {
    const result = await extra.api.vault.setWalletLabel(walletId, name);
    if (result) {
      dispatch({
        type: ActionTypes.WALLET_UPDATED,
        payload: {
          walletId,
          name
        }
      });
    }
  };
}

function readWalletFile (walletFile: Blob): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(walletFile);
    reader.onload = (event: ProgressEvent) => {
      if (!event.target) {
        reject(new Error('Invalid Event passed'));
        return;
      }
      // @ts-ignore
      const fileContent = event.target.result;
      try {
        const json = JSON.parse(fileContent);
        // json.filename = walletFile.name;
        resolve(json);
      } catch (e) {
        reject(new Error('Invalid or corrupted Wallet file, cannot be imported'));
      }
    };
  });
}

// function addAccount (
//   api: IApi, dispatch: Dispatch<any>, walletId: vault.Uuid, add: vault.AddAccount
// ) {
//   if (!walletId) {
//     throw Error('Wallet is not set');
//   }
//   const accountId = api.vault.addAccount(walletId, add);
//
//   dispatch(accountImportedAction(walletId, accountId));
//
//   return walletId;
// }

function importJson (
  blockchain: BlockchainCode,
  data: any
): Dispatched<IWalletCreatedAction> {
  return async (dispatch: any, getState, extra) => {
    const vault = extra.api.vault;
    const walletId = await vault.addWallet();
    const entryId = await vault.addEntry(walletId, {
      type: "ethereum-json",
      blockchain: blockchainCodeToId(blockchain),
      key: JSON.stringify(data)
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

export function importPk (
  blockchain: BlockchainCode,
  pk: string,
  password: string
): Dispatched<IWalletCreatedAction> {
  return async (dispatch: any, getState, extra) => {
    const vault = extra.api.vault;
    const walletId = await vault.addWallet();
    const entryId = await vault.addEntry(walletId, {
      type: "raw-pk-hex",
      blockchain: blockchainCodeToId(blockchain),
      key: pk,
      password
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

// /**
//  *
//  * @deprecated should have separate password
//  */
// export function importMnemonic (
//   blockchain: BlockchainCode, passphrase: string, mnemonic: string, hdPath: string, name: string
// ): Dispatched<IWalletCreatedAction> {
//   return (dispatch: any, getState, extra) => {
//     if (!blockchains.isValidChain(blockchain)) {
//       throw new Error('Invalid chain code: ' + blockchain);
//     }
//     const walletService = new WalletService(extra.api.vault);
//     const seedId = walletService.importMnemonic(mnemonic, passphrase);
//     const addRequest: AddEntry = {
//       blockchain: blockchainCodeToId(blockchain),
//       type: 'hd-path',
//       key: {
//         seed: {type: "id", value: seedId, password: passphrase},
//         hdPath,
//       }
//     };
//
//     return Promise.resolve(
//       createWalletWithAccount(extra.api, dispatch, blockchain, name, addRequest)
//     );
//
//   };
// }

export function importWalletFile(
  blockchain: BlockchainCode,
  file: Blob
): Dispatched<AccountsAction> {
  return async (dispatch: any, getState) => {
    const data = await readWalletFile(file);
    return dispatch(importJson(blockchain, data));
  };
}

export function generateMnemonic(handler?: (value: string) => void): Dispatched<any> {
  return (dispatch: any, getState, extra) => {
    extra.api.vault.generateMnemonic(24)
      .then(handler)
      .catch(dispatchRpcError(dispatch))
  };
}

export function loadSeedsAction(): ILoadSeedsAction {
  return {
    type: ActionTypes.LOAD_SEEDS
  };
}

export function setSeedsAction(seeds: SeedDescription[]): ISetSeedsAction {
  return {
    type: ActionTypes.SET_SEEDS,
    payload: seeds
  };
}

export function createSeed(seed: SeedDefinition, handler: (id: Uuid) => void): Dispatched<any> {
  return (dispatch, getState, extra) => {
    extra.api.vault.importSeed(seed)
      .then(handler)
      .catch(dispatchRpcError(dispatch))
  }
}

export function subscribeWalletBalance(walletId: Uuid): ISubWalletBalance {
  return {
    type: ActionTypes.SUBSCRIBE_WALLET_BALANCE,
    walletId
  };
}

export function unlockSeed(seedId: Uuid, password: string, handler: (valid: boolean) => void): Dispatched<any> {
  return (dispatch, getState, extra) => {
    const vault = extra.api.vault;
    const seed: IdSeedReference = {
      type: "id",
      value: seedId,
      password,
    }
    // just a random hd path
    // TODO always generate new random?
    const hdpath = "m/44'/15167'/8173'/68/164";
    vault.listSeedAddresses(seed, 100, [hdpath])
      .then((addresses) => {
        handler(typeof addresses[hdpath] == "string" && addresses[hdpath].length > 0);
      })
      .catch((_) => handler(false))
  }
}

export function nextAddress(entryId: EntryId, role: AddressRole): INextAddress {
  return {
    type: ActionTypes.NEXT_ADDRESS,
    entryId,
    addressRole: role
  }
}