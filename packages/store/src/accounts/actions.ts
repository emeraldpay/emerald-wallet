import * as vault from '@emeraldpay/emerald-vault-core';
import {
  blockchainByName,
  BlockchainCode,
  blockchainCodeToId,
  blockchains,
  IApi,
  IBackendApi,
  Logger,
  Wallet,
  WalletService
} from '@emeraldwallet/core';
import { put } from '@redux-saga/core/effects';
import { ipcRenderer } from 'electron';
import { Dispatch } from 'redux';
import { dispatchRpcError } from '../screen/actions';
import * as history from '../txhistory';
import { Dispatched, IExtraArgument } from '../types';
import * as selectors from './selectors';
import {
  ActionTypes,
  AddressesAction,
  ICreateWalletAction,
  IFetchErc20BalancesAction,
  ILoadWalletsAction,
  ISetBalanceAction,
  ISetLoadingAction,
  ISetTxCountAction,
  IUpdateWalletAction,
  IWalletCreatedAction,
  IWalletsLoaded,
  PendingBalanceAction
} from './types';

const log = Logger.forCategory('store.accounts');

export function setBalanceAction (balance: any): ISetBalanceAction {
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

export function setWalletsAction (wallets: Wallet[]): IWalletsLoaded {
  return {
    type: ActionTypes.SET_LIST,
    payload: wallets
  };
}

export function loadAccountBalance (blockchain: BlockchainCode, address: string) {
  ipcRenderer.send('subscribe-balance', blockchain, [address]);
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

function createWalletWithAccount (
  api: IApi,
  dispatch: Dispatch<any>,
  blockchain: BlockchainCode,
  walletName: string = '',
  add: vault.AddAccount
): { walletId: vault.Uuid, accountId: string } {
  const walletId = api.vault.addWallet(walletName);
  const accountId = api.vault.addAccount(walletId, add);
  const wallet = api.vault.getWallet(walletId)!;

  dispatch(walletCreatedAction(wallet));

  // dispatch(loadWalletsAction()); // reload only current wallet
  // loadAccountBalance(blockchain, account.address);
  return { walletId, accountId };
}

export function walletCreatedAction (wallet: any): IWalletCreatedAction {
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

export function createAccount (
  blockchain: BlockchainCode,
  passphrase: string,
  name: string = ''
): Dispatched<IWalletCreatedAction> {
  return (dispatch: any, getState, extra) => {

    const addRequest: vault.AddAccount = {
      blockchain: blockchainCodeToId(blockchain),
      type: 'generate-random',
      password: passphrase
    };

    return Promise.resolve(
      createWalletWithAccount(extra.api, dispatch, blockchain, name, addRequest)
    );
  };
}

export function exportPrivateKey (passphrase: string, accountId: vault.AccountId): any {
  return (dispatch: any, getState: any, extra: IExtraArgument) => {
    return extra.backendApi.exportRawPrivateKey(accountId, passphrase);
  };
}

export function exportKeyFile (accountId: vault.AccountId): any {
  return (dispatch: any, getState: any, extra: IExtraArgument) => {
    return extra.backendApi.exportJsonKeyFile(accountId);
  };
}

export function updateWallet (
  walletId: vault.Uuid, name: string
): Dispatched<IUpdateWalletAction> {
  return async (dispatch: any, getState, extra) => {
    const result = await extra.backendApi.updateWallet(walletId, name);
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
  return async (dispatch: any, getState, { backendApi }: { backendApi: IBackendApi }) => {
    const walletId = await backendApi.importEthereumJson(blockchain, JSON.stringify(data));
    const wallet = await backendApi.getWallet(walletId);

    // update redux store with new wallet
    dispatch(walletCreatedAction(wallet));

    dispatch(accountImportedAction(walletId));
    return Promise.resolve(walletId);
  };
}

export function importPk (
  blockchain: BlockchainCode,
  pk: string,
  password: string
): Dispatched<IWalletCreatedAction> {
  return async (dispatch: any, getState, { backendApi }: { backendApi: IBackendApi }) => {
    const walletId = await backendApi.importRawPrivateKey(blockchain, pk, password);

    const wallet = await backendApi.getWallet(walletId);

    // update redux store with new wallet
    dispatch(walletCreatedAction(wallet));

    dispatch(accountImportedAction(walletId));
    return Promise.resolve(walletId);
  };
}

export function importMnemonic (
  blockchain: BlockchainCode, passphrase: string, mnemonic: string, hdPath: string, name: string
): Dispatched<IWalletCreatedAction> {
  return (dispatch: any, getState, extra) => {
    if (!blockchains.isValidChain(blockchain)) {
      throw new Error('Invalid chain code: ' + blockchain);
    }
    const walletService = new WalletService(extra.api.vault);
    const seedId = walletService.importMnemonic(mnemonic, passphrase);
    const addRequest: vault.AddAccount = {
      blockchain: blockchainCodeToId(blockchain),
      type: 'hd-path',
      key: {
        seedId,
        hdPath,
        password: passphrase
      }
    };

    return Promise.resolve(
      createWalletWithAccount(extra.api, dispatch, blockchain, name, addRequest)
    );

  };
}

export function importWalletFile (
  blockchain: BlockchainCode,
  file: Blob
): Dispatched<AddressesAction> {
  return async (dispatch: any, getState) => {
    const data = await readWalletFile(file);
    return dispatch(importJson(blockchain, data));
  };
}

function clearBlock (tx: any) {
  return {
    ...tx,
    blockNumber: null
  };
}

// TODO move to backend side
export function loadPendingTransactions (): Dispatched<PendingBalanceAction> {
  return (dispatch: any, getState, extra) => {
    // TODO read from wallet settings
    ['ETH', 'ETC'].forEach((chainName) => {
      const blockchainCode = blockchainByName(chainName).params.code;
      extra.api.chain(blockchainCode).eth.getBlockByNumber('pending', true)
        .then((result: any) => {
          const addresses = selectors.allAccountsByBlockchain(getState(), blockchainCode)
            .map((account) => account.address);

          const txes = result.transactions.filter(
            (t: any) => addresses.includes(t.to) || addresses.includes(t.from)
          ).map((tx: any) => clearBlock(tx));
          if (txes.length === 0) {
            return;
          }

          dispatch(history.actions.trackTxs(txes, blockchainCode as BlockchainCode));

          for (const tx of txes) {
            const disp: PendingBalanceAction = {
              type: ActionTypes.PENDING_BALANCE,
              value: tx.value,
              gas: tx.gas,
              gasPrice: tx.gasPrice,
              from: '',
              to: '',
              blockchain: blockchainCode
            };
            if (addresses.includes(tx.from)) {
              disp.from = tx.from;
              dispatch(disp);
            }
            if (addresses.includes(tx.to)) {
              disp.to = tx.to;
              dispatch(disp);
            }
          }
        }).catch(dispatchRpcError(dispatch));
    });
  };
}

export function generateMnemonic (): Dispatched<any> {
  return (dispatch: any, getState, extra) => {
    return Promise.resolve(extra.api.vault.generateMnemonic(24));
  };
}
