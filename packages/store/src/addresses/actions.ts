import {ipcRenderer} from 'electron';
import {blockchainByName, BlockchainCode, EthereumTx, IApi} from "@emeraldwallet/core";
import {convert, EthAddress} from '@emeraldplatform/core';
import {Wei} from "@emeraldplatform/eth";
import {
  ActionTypes,
  AddAccountAction,
  ImportWalletAction,
  LoadingAction,
  PendingBalanceAction,
  SetHDPathAction,
  SetListAction,
  SetTxCountAction,
  UpdateAddressAction
} from "./types";
import {Dispatched, Transaction} from "../types";
import * as selectors from "./selectors";
import {catchError, dispatchRpcError, gotoScreen} from "../screen/actions";
import {Dispatch} from "react";
import * as history from '../txhistory';

const EthAccount = require('@emeraldplatform/eth-account').EthAccount;

/**
 * Retrieves HD paths for hardware accounts
 */
function fetchHdPaths(): Dispatched<SetHDPathAction> {
  return (dispatch, getState, api) => {
    const promises: Promise<any>[] = [];
    selectors.all(getState())
      .filter((a: any) => a.get('hardware', true))
      .forEach((a: any) => {
        const address = a.get('id');
        promises.push(api.emerald.exportAccount(address, a.get('blockchain').toLowerCase())
          .then((result) => {
            return dispatch({
              type: ActionTypes.SET_HD_PATH,
              accountId: address,
              hdpath: result.crypto.hd_path,
              blockchain: a.get('blockchain')
            });
          })
          .catch((err) => console.warn("Unable to get HDPath from Vault"))
        );
      });

    return Promise.all(promises);
  };
}

export function loadAccountsList(blockchains: Array<BlockchainCode>): Dispatched<SetListAction | LoadingAction | SetHDPathAction> {
  if (!blockchains) {
    console.warn("Chains are not passed");
    //TODO use chains from settings
    blockchains = [BlockchainCode.ETH, BlockchainCode.ETC, BlockchainCode.Morden, BlockchainCode.Kovan];
  }
  return (dispatch, getState, api) => {
    dispatch({type: ActionTypes.LOADING});
    const showHidden = getState().wallet.settings.get('showHiddenAccounts', false);

    // TODO read from wallet settings
    blockchains.forEach((blockchainCode) => {
      api.emerald.listAccounts(blockchainCode.toLowerCase(), showHidden)
        .then((res) => res.map((a) => ({...a, blockchain: blockchainCode})))
        .then((result) => {
          const existing = selectors.all(getState())
            .filter((account: any) => account.get('blockchain') === blockchainCode)
            .map((account: any) => account.get('id')).toJS();

          const fetched = result.map((account) => account.address);
          const notChanged = existing.length === fetched.length && fetched.every((x) => existing.includes(x));
          const firstLoad = existing.length === 0;
          if (notChanged && !firstLoad) {
            return;
          }

          dispatch(setListAction(result));
          dispatch(fetchHdPaths());

          const addedAddresses = result
            .filter((x) => existing.indexOf(x.address) < 0)
            .map((acc) => acc.address);
          ipcRenderer.send('subscribe-balance', blockchainCode, addedAddresses);
        })
    });
  };
}

function setListAction(addresses: any): SetListAction {
  return {
    type: ActionTypes.SET_LIST,
    payload: addresses,
  }
}

export function loadAccountBalance(blockchain: BlockchainCode, address: string) {
  ipcRenderer.send('subscribe-balance', blockchain, [address]);
}

export function loadAccountTxCount(accountId: string): Dispatched<SetTxCountAction> {
  return (dispatch, getState, api) => {
    selectors.findAllChains(getState(), accountId).forEach((acc) => {
      if (!acc) {
        return;
      }
      api.chain(acc.get('blockchain')).eth.getTransactionCount(acc.get('id'))
        .then((result: number) => {
          dispatch({
            type: ActionTypes.SET_TXCOUNT,
            accountId,
            value: result,
            blockchain: acc.get('blockchain')
          });
      }).catch(dispatchRpcError(dispatch));
    })
  };
}

export function createAccount(blockchain: BlockchainCode, passphrase: string, name: string = '', description: string = ''): Dispatched<AddAccountAction> {
  return (dispatch, getState, api) => {
    return api.emerald.newAccount(passphrase, name, description, blockchain.toLowerCase())
      .then((result) => {
        dispatch({
          type: ActionTypes.ADD_ACCOUNT,
          accountId: result,
          name,
          description,
          blockchain: blockchain,
        });
        loadAccountBalance(blockchain, result);
        return result;
      }).catch(dispatchRpcError(dispatch));
  };
}

export function exportPrivateKey(blockchain: BlockchainCode, passphrase: string, accountId: string): Dispatched<any> {
  return (dispatch, getState, api) => {
    return api.emerald.exportAccount(accountId, blockchain.toLowerCase()).then((result) => {
      const wallet = EthAccount.fromV3(result, passphrase);
      return wallet.getPrivateKeyString();
    });
  };
}

export function exportKeyFile(blockchain: BlockchainCode, accountId: string): Dispatched<any> {
  return (dispatch, getState, api) => {
    return api.emerald.exportAccount(accountId, blockchain.toLowerCase());
  };
}

export function updateAccount(blockchain: BlockchainCode, address: string, name: string, description: string): Dispatched<UpdateAddressAction> {
  return (dispatch, getState, api) => {
    const found = selectors.find(getState(), address, blockchain);
    if (!found) {
      console.error(`No address ${address} on chain ${blockchain}`);
      return;
    }
    return api.emerald.updateAccount(address, name, description, blockchain.toLowerCase())
      .then(() => {
        dispatch({
          type: ActionTypes.UPDATE_ACCOUNT,
          payload: {
            address,
            name,
            description,
            blockchain
          },
        });
      });
  };
}

function unwrap(value: string[] | string | null): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof value === 'string') {
      resolve(value)
    } if (value && value.length === 1) {
      resolve(value[0]);
    } else {
      reject(new Error(`Invalid list size ${value}`));
    }
  });
}


function onTxSend(dispatch: Dispatch<any>, sourceTx: Transaction, blockchain: BlockchainCode) {
  return (txHash: string) => {
    // dispatch(loadAccountBalance(sourceTx.from));
    const sentTx = {...sourceTx, hash: txHash};

    // TODO: dependency on wallet/history module!
    dispatch(history.actions.trackTx(sentTx, blockchain));
    dispatch(gotoScreen('transaction', sentTx));
  };
}

function getNonce(api: IApi, blockchain: BlockchainCode, address: string): Promise<number> {
  return api.chain(blockchain).eth.getTransactionCount(address);
}

function withNonce(tx: Transaction): (nonce: number) => Promise<Transaction> {
  return (nonce) => new Promise((resolve) => resolve(Object.assign({}, tx, {nonce: convert.quantitiesToHex(nonce)})));
}

function verifySender(expected: string): (a: string) => Promise<string> {
  return (raw: string) => new Promise((resolve, reject) => {
    const tx = EthereumTx.fromRaw(raw);
    if (tx.verifySignature()) {
      if (`0x${tx.getSenderAddress().toLowerCase()}` !== expected.toLowerCase()) {
        console.error(`WRONG SENDER: 0x${tx.getSenderAddress()} != ${expected}`);
        reject(new Error('Emerald Vault returned signature from wrong Sender'));
      } else {
        resolve(raw);
      }
    } else {
      console.error(`Invalid signature: ${raw}`);
      reject(new Error('Emerald Vault returned invalid signature for the transaction'));
    }
  });
}

function signTx(api: IApi, tx: Transaction, passphrase: string, blockchain: string): Promise<string | string[]> {
  console.debug(`Calling emerald api to sign tx from ${tx.from} to ${tx.to} in ${blockchain} blockchain`);
  if (blockchain === 'morden') {
    // otherwise RPC server gives 'wrong-sender'
    // vault has different chain-id settings for etc and eth morden. server uses etc morden.
    blockchain = 'etc-morden';
  }
  const plainTx = {
    from: tx.from,
    to: tx.to,
    gas: tx.gas,
    gasPrice: tx.gasPrice,
    value: tx.value,
    data: tx.data,
    nonce: tx.nonce
  };
  return api.emerald.signTransaction(plainTx, passphrase, blockchain.toLowerCase());
}

export function sendTransaction(blockchain: BlockchainCode,
                                from: string, passphrase: string, to: string, gas: number, gasPrice: Wei, value: Wei, data: string): Dispatched<any> {
  const originalTx: Transaction = {
    from,
    to,
    gas: convert.toHex(gas),
    gasPrice: gasPrice.toHex(),
    value: value.toHex(),
    data,
    nonce: '',
    blockchain: blockchain
  };
  return (dispatch, getState, api) => {
    return getNonce(api, blockchain, from)
      .then(withNonce(originalTx))
      .then((tx) => {
        return signTx(api, tx, passphrase, blockchain)
          .then(unwrap)
          .then(verifySender(from))
          .then((signed) => api.chain(blockchain).eth.sendRawTransaction(signed))
          .then(onTxSend(dispatch, tx, blockchain));
      })
      .catch(catchError(dispatch));
  };
}

function readWalletFile(walletFile: File) {
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
        json.filename = walletFile.name;
        resolve(json);
      } catch (e) {
        reject(new Error('Invalid or corrupted Wallet file, cannot be imported'));
      }
    };
  });
}

export function importJson(blockchain: BlockchainCode, data: any, name: string, description: string): Dispatched<ImportWalletAction | AddAccountAction> {
  return (dispatch, getState, api) => {
    data.name = name;
    data.description = description;
    return api.emerald.importAccount(data, blockchain.toLowerCase()).then((result) => {
      dispatch({
        type: ActionTypes.IMPORT_WALLET,
        accountId: result,
      });
      if ((new EthAddress(result)).isValid()) {
        dispatch({
          name,
          description,
          type: ActionTypes.ADD_ACCOUNT,
          accountId: result,
          blockchain: blockchain.toLowerCase(),
        });
        loadAccountBalance(blockchain, result);
        return result;
      }
      throw new Error(result);
    });
  };
}

export function importMnemonic(blockchain: BlockchainCode,
                               passphrase: string, mnemonic: string, hdPath: string, name: string, description: string): Dispatched<ImportWalletAction | AddAccountAction> {
  return (dispatch, getState, api) => {
    return api.emerald.importMnemonic(passphrase, name, description, mnemonic, hdPath, blockchain.toLowerCase()).then((result: string) => {
      dispatch({
        type: ActionTypes.IMPORT_WALLET,
        accountId: result,
      });
      if ((new EthAddress(result)).isValid()) {
        dispatch({
          type: ActionTypes.ADD_ACCOUNT,
          name, description,
          accountId: result,
          blockchain: blockchain
        });
        loadAccountBalance(blockchain, result);
        return result;
      }
      throw new Error(result);
    });
  };
}

export function importWallet(blockchain: BlockchainCode, wallet: File, name: string, description: string): Dispatched<ImportWalletAction | AddAccountAction> {
  return (dispatch, getState) => {
    return readWalletFile(wallet).then((data) => {
      return dispatch(importJson(blockchain, data, name, description));
    });
  };
}

function clearBlock(tx: any) {
  return {
    ...tx,
    blockNumber: null,
  };
}

// TODO move to backend side
export function loadPendingTransactions(): Dispatched<PendingBalanceAction> {
  return (dispatch, getState, api) => {
    // TODO read from wallet settings
    ['ETH', 'ETC'].forEach((chainName) => {
      const blockchainCode = blockchainByName(chainName).params.code;
      api.chain(blockchainCode).eth.getBlockByNumber('pending', true)
        .then((result) => {
          const addresses = selectors.all(getState()).map((acc: any) => acc.get('id'));

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
    })
  };
}

export function hideAccount(accountId: string): Dispatched<any> {
  return (dispatch, getState, api) => {
    selectors.findAllChains(getState(), accountId).forEach((acc: any) =>
      api.emerald.hideAccount(accountId, acc.get('blockchain').toLowerCase())
        .catch(catchError(dispatch)));
  };
}

export function unhideAccount(blockchain: BlockchainCode, address: string): Dispatched<any> {
  return (dispatch, getState, api) => {
    return api.emerald.unhideAccount(address, blockchain.toLowerCase())
      .then((result) => {
        return result;
      }).catch(catchError(dispatch));
  };
}

export function generateMnemonic(): Dispatched<any> {
  return (dispatch, getState, api) => {
    return api.emerald.generateMnemonic();
  };
}


