import {ipcRenderer} from 'electron';
import {blockchainByName, BlockchainCode, EthereumTx, IApi} from "@emeraldwallet/core";
import {convert, EthAddress} from '@emeraldplatform/core';
import {Wei} from "@emeraldplatform/eth";
const EthAccount = require('@emeraldplatform/eth-account').EthAccount;
import {
  ActionTypes,
  AddAccountAction,
  Address, ImportWalletAction,
  LoadingAction, PendingBalanceAction,
  SetHDPathAction,
  SetListAction,
  SetTxCountAction, UpdateAddressAction
} from "./types";
import {Dispatched, Transaction} from "../types";
import * as selectors from "./selectors";
import {dispatchRpcError, catchError, gotoScreen} from "../screen/actions";
import {Dispatch} from "react";
import * as history from '../txhistory';

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
            });
          })
          .catch((err) => console.warn("Unable to get HDPath from Vault"))
        );
      });

    return Promise.all(promises);
  };
}

export function loadAccountsList(): Dispatched<SetListAction | LoadingAction | SetHDPathAction> {
  return (dispatch, getState, api) => {
    dispatch({type: ActionTypes.LOADING});
    const showHidden = getState().wallet.settings.get('showHiddenAccounts', false);

    // TODO read from wallet settings
    ['ETH', 'ETC'].forEach((chainName) => {
      const chainCode = blockchainByName(chainName).params.coinTicker;
      api.emerald.listAccounts(chainCode.toLowerCase(), showHidden)
        .then((res) => res.map((a) => ({...a, blockchain: chainCode})))
        .then((result) => {
          const existing = selectors.all(getState())
            .filter((account: any) => account.get('blockchain') === chainCode)
            .map((account: any) => account.get('id')).toJS();

          const fetched = result.map((account) => account.address);
          const notChanged = existing.length === fetched.length && fetched.every((x) => existing.includes(x));
          const firstLoad = existing.length === 0;
          if (notChanged && !firstLoad) {
            return;
          }

          dispatch({
            type: ActionTypes.SET_LIST,
            payload: result,
            chain: chainCode as BlockchainCode
          });
          dispatch(fetchHdPaths());

          const addedAddresses = result
            .filter((x) => existing.indexOf(x.address) < 0)
            .map((acc) => acc.address);
          ipcRenderer.send('subscribe-balance', chainCode, addedAddresses);
        })
    });
  };
}

export function loadAccountBalance(chain: BlockchainCode, address: string) {
  ipcRenderer.send('subscribe-balance', chain, [address]);
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
          });
      }).catch(dispatchRpcError(dispatch));
    })
  };
}

export function createAccount(chain: BlockchainCode, passphrase: string, name: string = '', description: string = ''): Dispatched<AddAccountAction> {
  return (dispatch, getState, api) => {
    return api.emerald.newAccount(passphrase, name, description, chain.toLowerCase())
      .then((result) => {
        dispatch({
          type: ActionTypes.ADD_ACCOUNT,
          accountId: result,
          name,
          description,
          blockchain: chain,
        });
        loadAccountBalance(chain, result);
        return result;
      }).catch(dispatchRpcError(dispatch));
  };
}

export function exportPrivateKey(chain: BlockchainCode, passphrase: string, accountId: string): Dispatched<any> {
  return (dispatch, getState, api) => {
    return api.emerald.exportAccount(accountId, chain.toLowerCase()).then((result) => {
      const wallet = EthAccount.fromV3(result, passphrase);
      return wallet.getPrivateKeyString();
    });
  };
}

export function exportKeyFile(chain: BlockchainCode, accountId: string): Dispatched<any> {
  return (dispatch, getState, api) => {
    return api.emerald.exportAccount(accountId, chain.toLowerCase());
  };
}

export function updateAccount(chain: BlockchainCode, address: string, name: string, description: string): Dispatched<UpdateAddressAction> {
  return (dispatch, getState, api) => {
    const found = selectors.find(getState(), address, chain);
    if (!found) {
      console.error(`No address ${address} on chain ${chain}`);
      return;
    }
    return api.emerald.updateAccount(address, name, description, chain.toLowerCase())
      .then(() => {
        dispatch({
          type: ActionTypes.UPDATE_ACCOUNT,
          payload: {
            address,
            name,
            description,
          },
        });
      });
  };
}

function unwrap<T>(list: T[] | null): Promise<T> {
  return new Promise((resolve, reject) => {
    if (list && list.length === 1) {
      resolve(list[0]);
    } else {
      reject(new Error(`Invalid list size ${list}`));
    }
  });
}


function onTxSend(dispatch: Dispatch<any>, sourceTx: Transaction, chain: BlockchainCode) {
  return (txHash: string) => {
    // dispatch(loadAccountBalance(sourceTx.from));
    const sentTx = {...sourceTx, hash: txHash};

    // TODO: dependency on wallet/history module!
    dispatch(history.actions.trackTx(sentTx, chain));
    dispatch(gotoScreen('transaction', sentTx));
  };
}

function getNonce(api: IApi, chain: BlockchainCode, address: string): Promise<number> {
  return api.chain(chain).eth.getTransactionCount(address);
}

function withNonce(tx: Transaction): (nonce: number) => Promise<Transaction> {
  return (nonce) => new Promise((resolve) => resolve(Object.assign({}, tx, {nonce: convert.toHex(nonce)})));
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

function signTx(api: IApi, tx: Transaction, passphrase: string, chain: string): Promise<string> {
  console.trace(`Calling emerald api to sign tx from ${tx.from} to ${tx.to} in ${chain} blockchain`);
  if (chain === 'morden') {
    // otherwise RPC server gives 'wrong-sender'
    // vault has different chain-id settings for etc and eth morden. server uses etc morden.
    chain = 'etc-morden';
  }
  return api.emerald.signTransaction(tx, passphrase, chain.toLowerCase());
}

export function sendTransaction(chain: BlockchainCode,
                                from: string, passphrase: string, to: string, gas: number, gasPrice: Wei, value: Wei, data: string): Dispatched<any> {
  const originalTx: Transaction = {
    from,
    to,
    gas: convert.toHex(gas),
    gasPrice: gasPrice.toHex(),
    value: value.toHex(),
    data,
    nonce: '',
    chain: chain
  };
  return (dispatch, getState, api) => {
    return getNonce(api, chain, from)
      .then(withNonce(originalTx))
      .then((tx) => {
        return signTx(api, tx, passphrase, chain)
          // .then(unwrap)
          .then(verifySender(from))
          .then((signed) => api.chain(chain).eth.sendRawTransaction(signed))
          .then(onTxSend(dispatch, tx, chain));
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

export function importJson(chain: BlockchainCode, data: any, name: string, description: string): Dispatched<ImportWalletAction | AddAccountAction> {
  return (dispatch, getState, api) => {
    data.name = name;
    data.description = description;
    return api.emerald.importAccount(data, chain.toLowerCase()).then((result) => {
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
          blockchain: chain.toLowerCase(),
        });
        loadAccountBalance(chain, result);
        return result;
      }
      throw new Error(result);
    });
  };
}

export function importMnemonic(chain: BlockchainCode,
                               passphrase: string, mnemonic: string, hdPath: string, name: string, description: string): Dispatched<ImportWalletAction | AddAccountAction> {
  return (dispatch, getState, api) => {
    return api.emerald.importMnemonic(passphrase, name, description, mnemonic, hdPath, chain.toLowerCase()).then((result: string) => {
      dispatch({
        type: ActionTypes.IMPORT_WALLET,
        accountId: result,
      });
      if ((new EthAddress(result)).isValid()) {
        dispatch({
          type: ActionTypes.ADD_ACCOUNT,
          name, description,
          accountId: result,
          blockchain: chain
        });
        loadAccountBalance(chain, result);
        return result;
      }
      throw new Error(result);
    });
  };
}

export function importWallet(chain: BlockchainCode, wallet: File, name: string, description: string): Dispatched<ImportWalletAction | AddAccountAction> {
  return (dispatch, getState) => {
    return readWalletFile(wallet).then((data) => {
      return dispatch(importJson(chain, data, name, description));
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
      const chainCode = blockchainByName(chainName).params.coinTicker;
      api.chain(chainCode).eth.getBlockByNumber('pending', true)
        .then((result) => {
          const addresses = selectors.all(getState()).map((acc: any) => acc.get('id'));

          const txes = result.transactions.filter(
            (t: any) => addresses.includes(t.to) || addresses.includes(t.from)
          ).map((tx: any) => clearBlock(tx));
          if (txes.length === 0) {
            return;
          }

          dispatch(history.actions.trackTxs(txes, chainCode as BlockchainCode));

          for (const tx of txes) {
            const disp: PendingBalanceAction = {
              type: ActionTypes.PENDING_BALANCE,
              value: tx.value,
              gas: tx.gas,
              gasPrice: tx.gasPrice,
              from: '',
              to: '',
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

export function unhideAccount(chain: BlockchainCode, address: string): Dispatched<any> {
  return (dispatch, getState, api) => {
    return api.emerald.unhideAccount(address, chain.toLowerCase())
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


