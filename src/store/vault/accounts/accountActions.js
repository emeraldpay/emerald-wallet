// @flow
import EthereumTx from 'ethereumjs-tx';
import { convert, Wallet, Address } from 'emerald-js';
import { fromJS } from 'immutable';
import { loadTokensBalances } from '../tokens/tokenActions';
import screen from '../../wallet/screen';
import history from '../../wallet/history';
import launcher from '../../launcher';
import network from '../../network';
import ActionTypes from './actionTypes';
import createLogger from '../../../utils/logger';

const currentChain = (state) => launcher.selectors.getChainName(state);

type Transaction = {
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
    });
    // Tokens
    const tokens = getState().tokens;
    if (!tokens.get('loading')) {
      dispatch(loadTokensBalances([address]));
    }
  };
}

/**
 * Updates balances in one batch request
 */
function fetchBalances(addresses: Array<string>) {
  return (dispatch, getState, api) => {
    return api.geth.ext.getBalances(addresses).then((balances) => {
      dispatch({
        type: ActionTypes.SET_BALANCES,
        accountBalances: addresses.map((addr) => ({ accountId: addr, balance: balances[addr] })),
      });

      const tokens = getState().tokens;
      if (!tokens.get('loading')) {
        return dispatch(loadTokensBalances(addresses));
      }
    });
  };
}

/**
 * Retrieves HD paths for hardware accounts
 */
function fetchHdPaths() {
  return (dispatch, getState, api) => {
    const promises = [];
    const chain = currentChain(getState());
    getState().accounts.get('accounts')
      .filter((a) => a.get('hardware', false))
      .forEach((a) => {
        const address = a.get('id');
        promises.push(api.emerald.exportAccount(address, chain).then((result) => {
          return dispatch({
            type: ActionTypes.SET_HD_PATH,
            accountId: address,
            hdpath: JSON.parse(result).crypto.hd_path,
          });
        }));
      });

    return Promise.all(promises);
  };
}

export function loadAccountsList() {
  return (dispatch, getState, api) => {
    dispatch({ type: ActionTypes.LOADING });

    const chain = currentChain(getState());
    const showHidden = getState().wallet.settings.get('showHiddenAccounts', false);
    return api.emerald.listAccounts(chain, showHidden).then((result) => {
      dispatch({
        type: ActionTypes.SET_LIST,
        accounts: result,
      });

      return dispatch(fetchHdPaths()).then(() => {
        return dispatch(fetchBalances(result.map((account) => account.address)));
      });
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
    });
  };
}

export function exportPrivateKey(passphrase: string, accountId: string) {
  return (dispatch, getState, api) => {
    const chain = currentChain(getState());
    return api.emerald.exportAccount(accountId, chain).then((result) => {
      const wallet = Wallet.fromV3(result, passphrase);
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
        });
        dispatch(network.actions.loadAddressesTransactions(fromJS([result])));
        dispatch(loadAccountBalance(result));
        return result;
      }).catch(screen.actions.catchError(dispatch));
  };
}
export function updateAccount(address: string, name: string, description?: string) {
  return (dispatch, getState, api) => {
    const chain = currentChain(getState());
    return api.emerald.updateAccount(address, name, description, chain)
      .then((result) => {
        dispatch({
          type: ActionTypes.UPDATE_ACCOUNT,
          address,
          name,
          description,
        });
      });
  };
}

function unwrap(list) {
  return new Promise((resolve, reject) => {
    if (list.length === 1) {
      resolve(list[0]);
    } else {
      reject(new Error(`Invalid list size ${list.length}`));
    }
  });
}

function onTxSend(dispatch, sourceTx: Transaction) {
  return (txHash: string) => {
    dispatch(loadAccountBalance(sourceTx.from));
    const sentTx = Object.assign({}, sourceTx, {hash: txHash});

    // TODO: dependency on wallet/history module!
    dispatch(history.actions.trackTx(sentTx));
    dispatch(screen.actions.gotoScreen('transaction', sentTx));
  };
}

function getNonce(api, address: string) {
  return api.geth.eth.getTransactionCount(address);
}

function withNonce(tx: Transaction): (nonce: string) => Promise<Transaction> {
  return (nonce) => new Promise((resolve, reject) =>
    resolve(Object.assign({}, tx, { nonce: convert.toHex(nonce) }))
  );
}

function verifySender(expected) {
  return (raw: string) =>
    new Promise((resolve, reject) => {
      const tx = new EthereumTx(raw);
      if (tx.verifySignature()) {
        if (`0x${tx.getSenderAddress().toString('hex').toLowerCase()}` !== expected.toLowerCase()) {
          log.error(`WRONG SENDER: 0x${tx.getSenderAddress().toString('hex')} != ${expected}`);
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
  return api.emerald.signTransaction(tx, passphrase, chain);
}

export function sendTransaction(from: string, passphrase: string, to: ?string, gas: string,
  gasPrice: string, value: string, data?: string) {
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
    const chain = currentChain(getState());
    return getNonce(api, from)
      .then(withNonce(originalTx))
      .then((tx) => {
        return signTx(api, tx, passphrase, chain)
          .then(unwrap)
          .then(verifySender(from))
          .then((signed) => api.geth.eth.sendRawTransaction(signed))
          .then(onTxSend(dispatch, tx));
      })
      .catch(screen.actions.catchError(dispatch));
  };
}

export function createContract(accountId: string, passphrase: string, gas, gasPrice, data) {
  const txData = {
    passphrase,
    gas,
    gasPrice,
    data,
    from: accountId,
    nonce: '',
    value: '0x0',
  };
  return (dispatch, getState, api) => {
    const chain = currentChain(getState());
    api.emerald.signTransaction(txData, { chain })
      .then(unwrap)
      .then(api.geth.eth.sendRawTransaction)
      .then(onTxSend(dispatch, txData))
      .catch(log.error);
  };
}

function readWalletFile(wallet) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(wallet);
    reader.onload = (event) => {
      let data;
      try {
        data = JSON.parse(event.target.result);
        data.filename = wallet.name;
        resolve(data);
      } catch (e) {
        reject({error: e});
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
      if (Address.isValid(result)) {
        dispatch({
          name,
          description,
          type: ActionTypes.ADD_ACCOUNT,
          accountId: result,
        });
        dispatch(network.actions.loadAddressesTransactions(fromJS([result])));
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
      if (Address.isValid(result)) {
        dispatch({
          type: ActionTypes.ADD_ACCOUNT,
          accountId: result,
        });
        dispatch(network.actions.loadAddressesTransactions(fromJS([result])));
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

export function loadPendingTransactions() {
  return (dispatch, getState, api) =>
    api.geth.eth.getBlockByNumber('pending', true).then((result) => {
      const addrs = getState().accounts.get('accounts').map((acc) => acc.get('id'));
      const txes = result.transactions.filter(
        (t) => addrs.includes(t.to) || addrs.includes(t.from)
      ).map((tx) => {
        if (tx.blockNumber) {
          delete tx.blockNumber;
        }
        return tx;
      });
      if (txes.length === 0) { return; }

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
    });
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

export function unhideAccount(accountId: string) {
  return (dispatch, getState, api) => {
    const chain = currentChain(getState());

    return api.emerald.unhideAccount(accountId, chain)
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
