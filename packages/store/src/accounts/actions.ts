import {
  Blockchain,
  blockchainByName, blockchainCodeToId,
  BlockchainCode,
  blockchains,
  IApi,
  isValidEthAddress, blockchainById,
} from '@emeraldwallet/core';
import {ipcRenderer} from 'electron';
import {dispatchRpcError} from '../screen/actions';
import * as settings from '../settings';
import * as history from '../txhistory';
import {Dispatched} from '../types';
import * as selectors from './selectors';
import {
  ActionTypes, AddressesAction,
  AddWalletAction,
  IFetchErc20BalancesAction,
  IFetchHdPathsAction,
  IUpdateAddressAction,
  PendingBalanceAction,
  SetListAction,
  SetLoadingAction,
  SetTxCountAction
} from './types';
import * as vault from '@emeraldpay/emerald-vault-core';
import {Dispatch} from "react";
import { WalletsOp } from '@emeraldpay/emerald-vault-core';

export function setLoadingAction (loading: boolean): SetLoadingAction {
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

export function loadAccountsList (onLoaded?: Function): Dispatched<SetListAction | SetLoadingAction> {

  return (dispatch, getState, api) => {
    dispatch(setLoadingAction(true));

    let wallets = api.vault.listWallets();
    dispatch(setListAction(wallets));
    dispatch(fetchErc20BalancesAction() as any);
    dispatch(setLoadingAction(false));

    let subscribe: {[key: string]: string[]} = {};
    WalletsOp.of(wallets)
      .getAccounts()
      .forEach((account) => {
        let code = blockchainById(account.blockchain)!.params.code;
        let current = subscribe[code];
        if (typeof current === 'undefined') {
          current = [];
        }
        current.push(account.address);
        subscribe[code] = current;
      });

    Object.keys(subscribe).forEach((blockchainCode) => {
      let addedAddresses = subscribe[blockchainCode];
      ipcRenderer.send('subscribe-balance', blockchainCode, addedAddresses);
    })
  }
}

function setListAction (wallets: vault.Wallet[]): SetListAction {
  return {
    type: ActionTypes.SET_LIST,
    payload: wallets
  };
}

export function loadAccountBalance (blockchain: BlockchainCode, address: string) {
  ipcRenderer.send('subscribe-balance', blockchain, [address]);
}

export function loadAccountTxCount (walletId: string): Dispatched<SetTxCountAction> {
  return (dispatch, getState, api) => {
    selectors.all(getState()).getAccounts().forEach((acc) => {
      let blockchainCode = blockchainById(acc.blockchain)!.params.code;
      api.chain(blockchainCode).eth.getTransactionCount(acc.address)
        .then((result: number) => {
          dispatch({
            type: ActionTypes.SET_TXCOUNT,
            accountId: acc.id,
            value: result
          });
        }).catch(dispatchRpcError(dispatch));
    });
  };
}

function addAccount(api: IApi, dispatch: Dispatch<any>,
                    walletId: vault.Uuid, add: vault.AddAccount) {
  if (!walletId) {
    throw Error("Wallet is not set");
  }
  let accountId = api.vault.addAccount(walletId, add);
  let wallet = api.vault.getWallet(walletId)!;
  dispatch({
    type: ActionTypes.ADD_WALLET,
    wallet: wallet
  });
  let account = wallet.accounts[0] as vault.EthereumAccount;
  dispatch(loadAccountsList()); //reload only current wallet
  // loadAccountBalance(blockchainById(add.blockchain)!!.params.code, account.address);
  return walletId;
}

function createWalletWithAccount(api: IApi, dispatch: Dispatch<any>,
                                 blockchain: BlockchainCode, name: string = '', add: vault.AddAccount): vault.Uuid {
  let walletId = api.vault.addWallet(name);
  let accountId = api.vault.addAccount(walletId, add);
  let wallet = api.vault.getWallet(walletId)!;
  dispatch({
    type: ActionTypes.ADD_WALLET,
    wallet: wallet
  });
  let account = wallet.accounts[0] as vault.EthereumAccount;
  dispatch(loadAccountsList()); //reload only current wallet
  // loadAccountBalance(blockchain, account.address);
  return walletId;
}

export function createAccount (
  blockchain: BlockchainCode, passphrase: string, name: string = '', description: string = ''
): Dispatched<AddWalletAction> {
  return (dispatch, getState, api) => {
    createWalletWithAccount(api, dispatch,
       blockchain, name, {
        blockchain: blockchainCodeToId(blockchain),
        type: "generate-random"
      });
  }
}

export function exportPrivateKey (passphrase: string, accountId: vault.AccountId): any {
  return (dispatch: any, getState: any, api: IApi) => {
    return api.vault.exportJsonPk(accountId, passphrase);
  };
}

export function exportKeyFile (accountId: vault.AccountId): any {
  return (dispatch: any, getState: any, api: IApi) => {
    return api.vault.exportJsonPk(accountId, undefined);
  };
}

export function updateWallet (
  walletId: vault.Uuid, name: string, description: string
): Dispatched<IUpdateAddressAction> {
  return (dispatch, getState, api) => {
    if (api.vault.setWalletLabel(walletId, name)) {
      dispatch({
        type: ActionTypes.UPDATE_ACCOUNT,
        payload: {
          walletId,
          name,
          description
        }
      });
    }
  };
}

function readWalletFile (walletFile: Blob) {
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

export function importJson (
  wallet: vault.Uuid,
  blockchain: BlockchainCode,
  data: any
): Dispatched<AddWalletAction> {
  return (dispatch, getState, api) => {
    addAccount(api, dispatch,
      wallet, {
      blockchain: blockchainCodeToId(blockchain),
      type: "ethereum-json",
      key: JSON.stringify(data)
    });
  };
}

export function importMnemonic (
  blockchain: BlockchainCode, passphrase: string, mnemonic: string, hdPath: string, name: string, description: string
): Dispatched<AddWalletAction> {
  return (dispatch, getState, api) => {
    if (!blockchains.isValidChain(blockchain)) {
      throw new Error('Invalid chain code: ' + blockchain);
    }
    let seedId = api.vault.importSeed({
      type: "mnemonic",
      password: passphrase,
      value: mnemonic
    });
    createWalletWithAccount(api, dispatch,
      blockchain, name, {
      blockchain: blockchainCodeToId(blockchain),
      type: "hd-path",
      key: {
        seedId,
        hdPath,
        password: passphrase
      }
    });
  };
}

export function importWalletFile (
  wallet: vault.Uuid,
  blockchain: BlockchainCode,
  file: Blob
): Dispatched<AddressesAction> {
  return (dispatch, getState) => {
    return readWalletFile(file).then((data) => {
      return dispatch(importJson(wallet, blockchain, data));
    });
  };
}

export function importPk (
  blockchain: BlockchainCode, pk: string, password: string, name: string, description: string
): Dispatched<AddWalletAction> {
  return (dispatch, getState, api) => {
    createWalletWithAccount(api, dispatch,
      blockchain, name, {
        blockchain: blockchainCodeToId(blockchain),
        type: "raw-pk-hex",
        key: pk,
        password
      });
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
  return (dispatch, getState, api) => {
    // TODO read from wallet settings
    ['ETH', 'ETC'].forEach((chainName) => {
      const blockchainCode = blockchainByName(chainName).params.code;
      api.chain(blockchainCode).eth.getBlockByNumber('pending', true)
        .then((result: any) => {
          const addresses = selectors.all(getState())
            .accountsByBlockchain(blockchainCodeToId(blockchainCode))
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
  return (dispatch, getState, api) => {
    return api.vault.generateMnemonic(24);
  };
}
