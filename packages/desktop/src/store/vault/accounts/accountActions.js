// @flow
import {ipcRenderer} from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import {EthereumTx, BlockchainCode} from '@emeraldwallet/core';
import {convert, EthAddress} from '@emeraldplatform/core';
import {EthAccount} from '@emeraldplatform/eth-account';
import {loadTokensBalances} from '../tokens/tokenActions';
import history from '../../wallet/history';
import launcher from '../../launcher';
import ActionTypes from './actionTypes';
import createLogger from '../../../utils/logger';
import { screen } from '../..';

const { dispatchRpcError } = screen.actions;
const currentChain = (state) => launcher.selectors.getChainName(state);

type
Transaction = {
  from: string,
  // Can also be null or void
  to: ?string,
  value: string,
  nonce: string,
  gas: string,
  gasPrice: string,
  // Can either be void or omitted altogether. Cannot be null
  data?: string,
}

const log = createLogger('accountActions');

export function loadAccountBalance(address: string) {
  return (dispatch, getState, api) => {
    api.geth.eth.getBalance(address).then((result) => {
      dispatch({
        type: ActionTypes.SET_BALANCE,
        accountId: address,
        value: result,
      });
    }).catch(dispatchRpcError(dispatch));
    // Tokens
    const {tokens} = getState();
    if (!tokens.get('loading')) {
      dispatch(loadTokensBalances([address]));
    }
  };
}

/**
 * Retrieves HD paths for hardware accounts
 */
function fetchHdPaths() {
  return (dispatch, getState, api) => {
    const promises = [];
    getState().accounts.get('accounts')
      .filter((a) => a.get('hardware', false))
      .forEach((a) => {
        const address = a.get('id');
        promises.push(api.emerald.exportAccount(address, a.get('blockchain')).then((result) => {
          return dispatch({
            type: ActionTypes.SET_HD_PATH,
            accountId: address,
            hdpath: result.crypto.hd_path,
          });
        }));
      });

    return Promise.all(promises);
  };
}

export function loadAccountsList() {
  return (dispatch, getState, api) => {
    dispatch({type: ActionTypes.LOADING});
    const showHidden = getState().wallet.settings.get('showHiddenAccounts', false);

    const existing = getState().accounts.get('accounts').map((account) => account.get('id')).toJS();

    // request addresses for all chains we support
    return Promise.all([
      api.emerald.listAccounts(BlockchainCode.ETC, showHidden).then((res) => res.map((a) => ({...a, blockchain: BlockchainCode.ETC}))),
      api.emerald.listAccounts(BlockchainCode.ETH, showHidden).then((res) => res.map((a) => ({...a, blockchain: BlockchainCode.ETH}))),
    ]).then((results) => {
      const result = results[0].concat(results[1]);

      // TODO: in case both chains have one address it won't work
      const fetched = result.map((account) => account.address);
      const notChanges = existing.length === fetched.length && fetched.every((x) => existing.includes(x));
      if (notChanges) {
        return;
      }

      dispatch({
        type: ActionTypes.SET_LIST,
        payload: result,
      });
      dispatch(fetchHdPaths());

      ipcRenderer.send('subscribe-balance', fetched);
    });
  };
}

export function loadAccountTxCount(accountId: string) {
  return (dispatch, getState, api) => {
    api.geth.eth.getTransactionCount(accountId).then((result) => {
      dispatch({
        type: ActionTypes.SET_TXCOUNT,
        accountId,
        value: result,
      });
    }).catch(dispatchRpcError(dispatch));
  };
}

export function exportPrivateKey(passphrase: string, accountId: string) {
  return (dispatch, getState, api) => {
    const chain = currentChain(getState());
    return api.emerald.exportAccount(accountId, chain).then((result) => {
      const wallet = EthAccount.fromV3(result, passphrase);
      return wallet.getPrivateKeyString();
    });
  };
}

export function exportKeyFile(accountId: string) {
  return (dispatch, getState, api) => {
    const chain = currentChain(getState());
    return api.emerald.exportAccount(accountId, chain);
  };
}

export function createAccount(passphrase: string, name: string = '', description: string = '') {
  return (dispatch, getState, api) => {
    const chain = currentChain(getState());

    return api.emerald.newAccount(passphrase, name, description, chain)
      .then((result) => {
        log.debug(`Account ${result} created`);
        dispatch({
          type: ActionTypes.ADD_ACCOUNT,
          accountId: result,
          name,
          description,
          blockchain: chain,
        });
        dispatch(loadAccountBalance(result));
        return result;
      }).catch(screen.actions.catchError(dispatch));
  };
}

export function updateAccount(address, name, description) {
  return (dispatch, getState, api) => {
    const chain = currentChain(getState());
    return api.emerald.updateAccount(address, name, description, chain)
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

function unwrap(list) {
  return new Promise((resolve, reject) => {
    if (list && list.length === 1) {
      resolve(list[0]);
    } else {
      reject(new Error(`Invalid list size ${list}`));
    }
  });
}

function onTxSend(dispatch, sourceTx: Transaction, chain) {
  return (txHash: string) => {
    // dispatch(loadAccountBalance(sourceTx.from));
    const sentTx = {...sourceTx, hash: txHash};

    // TODO: dependency on wallet/history module!
    dispatch(history.actions.trackTx(sentTx, chain));
    dispatch(screen.actions.gotoScreen('transaction', sentTx));
  };
}

function getNonce(api, chain, address: string) {
  return api.chain(chain).eth.getTransactionCount(address);
}

function withNonce(tx: Transaction): (nonce: string) => Promise<Transaction> {
  return (nonce) => new Promise((resolve) => resolve(Object.assign({}, tx, {nonce: convert.toHex(nonce)})));
}

function verifySender(expected) {
  return (raw: string) => new Promise((resolve, reject) => {
    const tx = EthereumTx.fromRaw(raw);
    if (tx.verifySignature()) {
      if (`0x${tx.getSenderAddress().toLowerCase()}` !== expected.toLowerCase()) {
        log.error(`WRONG SENDER: 0x${tx.getSenderAddress()} != ${expected}`);
        reject(new Error('Emerald Vault returned signature from wrong Sender'));
      } else {
        resolve(raw);
      }
    } else {
      log.error(`Invalid signature: ${raw}`);
      reject(new Error('Emerald Vault returned invalid signature for the transaction'));
    }
  });
}

function signTx(api, tx: Transaction, passphrase: string, chain: string) {
  log.trace(`Calling emerald api to sign tx from ${tx.from} to ${tx.to} in ${chain} blockchain`);
  if (chain === 'morden') {
    // otherwise RPC server gives 'wrong-sender'
    // vault has different chain-id settings for etc and eth morden. server uses etc morden.
    chain = 'etc-morden';
  }
  return api.emerald.signTransaction(tx, passphrase, chain);
}

export function sendTransaction(chain, from: string, passphrase: string, to, gas, gasPrice: string, value: string, data) {
  const originalTx: Transaction = {
    from,
    to,
    gas,
    gasPrice,
    value,
    data,
    nonce: '',
  };
  return (dispatch, getState, api) => {
    return getNonce(api, chain, from)
      .then(withNonce(originalTx))
      .then((tx) => {
        return signTx(api, tx, passphrase, chain)
          .then(unwrap)
          .then(verifySender(from))
          .then((signed) => api.chain(chain).eth.sendRawTransaction(signed))
          .then(onTxSend(dispatch, tx, chain));
      })
      .catch(screen.actions.catchError(dispatch));
  };
}

function readWalletFile(walletFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(walletFile);
    reader.onload = (event) => {
      const fileContent = event.target.result;
      try {
        const json = JSON.parse(fileContent);
        json.filename = walletFile.name;
        resolve(json);
      } catch (e) {
        reject(new Error('Invalid or corrupted Wallet file, cannot be imported')); // eslint-disable-line
      }
    };
  });
}

export function importJson(data, name: string, description: string) {
  return (dispatch, getState, api) => {
    const chain = currentChain(getState());
    data.name = name;
    data.description = description;
    return api.emerald.importAccount(data, chain).then((result) => {
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
        });
        dispatch(loadAccountBalance(result));
        return result;
      }
      throw new Error(result);
    });
  };
}

export function importMnemonic(passphrase: string, mnemonic: string, hdPath: string, name: string, description: string) {
  return (dispatch, getState, api) => {
    const chain = currentChain(getState());
    return api.emerald.importMnemonic(passphrase, name, description, mnemonic, hdPath, chain).then((result) => {
      dispatch({
        type: ActionTypes.IMPORT_WALLET,
        accountId: result,
      });
      if ((new EthAddress(result)).isValid()) {
        dispatch({
          type: ActionTypes.ADD_ACCOUNT,
          accountId: result,
        });
        dispatch(loadAccountBalance(result));
        return result;
      }
      throw new Error(result);
    });
  };
}

export function importWallet(wallet, name: string, description: string) {
  return (dispatch, getState) => {
    return readWalletFile(wallet).then((data) => {
      return dispatch(importJson(data, name, description));
    });
  };
}

function clearBlock(tx) {
  return {
    ...tx,
    blockNumber: null,
  };
}

export function loadPendingTransactions() {
  return (dispatch, getState, api) => api.geth.eth.getBlockByNumber('pending', true).then((result) => {
    const addrs = getState().accounts.get('accounts').map((acc) => acc.get('id'));
    const txes = result.transactions.filter(
      (t) => addrs.includes(t.to) || addrs.includes(t.from)
    ).map((tx) => clearBlock(tx));
    if (txes.length === 0) {
      return;
    }

    dispatch(history.actions.trackTxs(txes));

    for (const tx of txes) {
      const disp = {
        type: ActionTypes.PENDING_BALANCE,
        value: tx.value,
        gas: tx.gas,
        gasPrice: tx.gasPrice,
        from: '',
        to: '',
      };
      if (addrs.includes(tx.from)) {
        disp.from = tx.from;
        dispatch(disp);
      }
      if (addrs.includes(tx.to)) {
        disp.to = tx.to;
        dispatch(disp);
      }
    }
  }).catch(dispatchRpcError(dispatch));
}

export function hideAccount(accountId: string) {
  return (dispatch, getState, api) => {
    const chain = currentChain(getState());

    return api.emerald.hideAccount(accountId, chain)
      .then((result) => {
        return result;
      }).catch(screen.actions.catchError(dispatch));
  };
}

export function unhideAccount(address: string) {
  return (dispatch, getState, api) => {
    const chain = currentChain(getState());

    return api.emerald.unhideAccount(address, chain)
      .then((result) => {
        return result;
      }).catch(screen.actions.catchError(dispatch));
  };
}

export function generateMnemonic() {
  return (dispatch, getState, api) => {
    return api.emerald.generateMnemonic();
  };
}
