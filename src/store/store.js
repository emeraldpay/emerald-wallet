/* eslint-disable import/no-extraneous-dependencies */
import thunkMiddleware from 'redux-thunk';
import createReduxLogger from 'redux-logger';
import { createStore as createReduxStore, applyMiddleware, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { ipcRenderer } from 'electron';
import EthereumQRPlugin from 'ethereum-qr-code'
import { fromJS } from 'immutable';
import * as qs from 'qs';
import Contract from '../lib/contract';

import { api } from '../lib/rpc/api';
import { intervalRates } from './config';
import history from './wallet/history';
import accounts from './vault/accounts';
import network from './network';
import screen from './wallet/screen';
import settings from './wallet/settings';
import tokens from './vault/tokens';
import ledger from './ledger';
import Addressbook from './vault/addressbook';

import { readConfig, listenElectron, connecting, loadClientVersion } from './launcher/launcherActions';
import launcherReducers from './launcher/launcherReducers';
import walletReducers from './wallet/walletReducers';
import deployedTokens from '../lib/deployedTokens';
import getWalletVersion from '../utils/get-wallet-version';
import createLogger from '../utils/logger';
import reduxLogger from '../utils/redux-logger';
import reduxMiddleware from './middleware';

const log = createLogger('store');
const qr = new EthereumQRPlugin()

const reducers = {
  accounts: accounts.reducer,
  addressBook: Addressbook.reducer,
  tokens: tokens.reducer,
  network: network.reducer,
  launcher: launcherReducers,
  ledger: ledger.reducer,
  form: formReducer,
  wallet: walletReducers,
}


/**
 * Creates Redux store with API as dependency injection.
 *
 * Injecting api allows to write unit tests.
 *
 * @param _api
 */
export const createStore = (_api) => {
  const storeMiddleware = [
    reduxMiddleware.promiseCatchAll,
    thunkMiddleware.withExtraArgument(_api),
  ];

  if (process.env.NODE_ENV !== 'test') {
    storeMiddleware.push(reduxLogger);
  }

  return createReduxStore(
    combineReducers(reducers),
    applyMiddleware(...storeMiddleware)
  );
};

export const store = createStore(api);

function refreshAll() {
  let promises = [
    store.dispatch(accounts.actions.loadPendingTransactions()),
    store.dispatch(network.actions.loadHeight(false)),
    store.dispatch(accounts.actions.loadAccountsList()),
    store.dispatch(history.actions.refreshTrackedTransactions()),
  ];

  const state = store.getState();

  if (state.launcher.getIn(['geth', 'type']) === 'local') {
    promises = promises.concat([
      /* store.dispatch(network.actions.loadPeerCount()),*/
      store.dispatch(network.actions.loadSyncing()),
    ]);
  }

  // Main loop that will refresh UI as needed
  setTimeout(refreshAll, intervalRates.continueRefreshAllTxRate);

  return Promise.all(promises);
}

function refreshLong() {
  store.dispatch(settings.actions.getExchangeRates());
  setTimeout(refreshLong, intervalRates.continueRefreshLongRate);
}

const historyForAddress = () => {

};

export function startSync() {
  store.dispatch(network.actions.getGasPrice());
  store.dispatch(loadClientVersion());
  store.dispatch(Addressbook.actions.loadAddressBook());
  store.dispatch(tokens.actions.loadTokenList());

  const state = store.getState();

  const chain = state.launcher.getIn(['chain', 'name']);

  if (chain === 'mainnet') {
    store.dispatch(ledger.actions.setBaseHD("m/44'/60'/160720'/0'"));
  } else if (chain === 'morden') {
    // FIXME ledger throws "Invalid status 6804" for 44'/62'/0'/0
    store.dispatch(ledger.actions.setBaseHD("m/44'/61'/1'/0"));
  }

  if (state.launcher.getIn(['geth', 'type']) !== 'remote') {
    // check for syncing
    setTimeout(() => store.dispatch(network.actions.loadSyncing()), intervalRates.second); // prod: intervalRates.second
    // double check for syncing
    setTimeout(() => store.dispatch(network.actions.loadSyncing()), 2 * intervalRates.minute); // prod: 30 * this.second
  }

  const chainId = state.launcher.getIn(['chain', 'id']);
  store.dispatch(history.actions.init(chainId));

  // deployed tokens
  const known = deployedTokens[+chainId];

  if (known) {
    known.forEach((token) => store.dispatch(tokens.actions.addToken(token)));
  }

  refreshAll().then(() => {
    store.dispatch(network.actions.loadAddressesTransactions(store.getState().accounts.get('accounts').map((account) => account.get('id'))));
  });

  setTimeout(refreshLong, 3 * intervalRates.second);
  store.dispatch(connecting(false));
}

export function stopSync() {
  // TODO
}

function newWalletVersionCheck() {
  getWalletVersion().then((versionDetails) => {
    if (!versionDetails.isLatest) {
      const params = [
        `A new version of Emerald Wallet is available (${versionDetails.tag}).`,
        'info',
        20 * 1000,
        'Update',
        screen.actions.openLink(versionDetails.downloadLink),
      ];

      store.dispatch(screen.actions.showNotification(...params));
    }
  });
}

export const start = () => {
  try {
    store.dispatch(readConfig());
    store.dispatch(settings.actions.loadSettings());
  } catch (e) {
    log.error(e);
  }
  store.dispatch(listenElectron());
  store.dispatch(screen.actions.gotoScreen('welcome'));

  ipcRenderer.on('protocol', (event, request) => {
    const paymentParams = qs.parse(request.url.split('?')[1]);
    console.log('paymentParams', paymentParams);
    const abi = [paymentParams.functionSignature];
    const contract = new Contract(abi);
    const args = {};
    let data;

    const isContractFunction = paymentParams.mode && paymentParams.mode === 'contract_function';
    if (isContractFunction) {
      paymentParams.argsDefaults.forEach((i) => {
        args[i.name] = i.value;
      });
      data = contract.functionToData(paymentParams.functionSignature.name, args);
    }

    let transaction = {
      amount: paymentParams.value,
      gas: paymentParams.gas,
    };
    if (isContractFunction) {
      transaction = {
        ...transaction,
        typedData: {
          name: paymentParams.functionSignature.name,
          argsDefaults: paymentParams.argsDefaults
        },
        data
      }
    }

    const state = store.getState();
    const accounts = state.accounts.get('accounts');

    let fromAccount = accounts.first();
    if (paymentParams.from) {
      fromAccount = accounts.find(
        (account) => account.get('id') === paymentParams.from
      ) || fromAccount;
    }

    store.dispatch(screen.actions.gotoScreen('repeat-tx', {
      transaction: fromJS(transaction),
      toAccount: fromJS({id: paymentParams.to}),
      fromAccount,
    }));
  });

  newWalletVersionCheck();
};

export function waitForServices(cb) {
  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    if (state.launcher.get('terms') === 'v1'
            && state.launcher.getIn(['geth', 'status']) === 'ready'
            && state.launcher.getIn(['connector', 'status']) === 'ready') {
      unsubscribe();
      log.info('All services are ready to use by Wallet');
      startSync();
      // If not first run, go right to home when ready.
      if (state.wallet.screen.get('screen') === 'welcome') { //  && !state.launcher.get('firstRun'))
        store.dispatch(accounts.actions.loadAccountsList()).then(() => {
          const loadedAccounts = store.getState().accounts.get('accounts');
          if (loadedAccounts.count() > 0) {
            store.dispatch(screen.actions.gotoScreen('home'));
          } else {
            store.dispatch(screen.actions.gotoScreen('landing'));
          }
        });
      }
      cb();
    }
  });

  function checkServiceStatus() {
    // hack to make some stuff work in storybook: @shanejonas
    if (!ipcRenderer) {
      return;
    }
    ipcRenderer.send('get-status');
  }
  setTimeout(checkServiceStatus, 2000);
}

export function waitForServicesRestart() {
  store.dispatch(connecting(true));
  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    if (state.launcher.getIn(['geth', 'status']) !== 'ready'
            || state.launcher.getIn(['connector', 'status']) !== 'ready') {
      unsubscribe();
      waitForServices();
    }
  });
}

export function screenHandlers() {
  let prevScreen = null;
  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    const curScreen = state.wallet.screen.get('screen');
    const justOpened = prevScreen !== curScreen;
    prevScreen = curScreen;
    if (justOpened) {
      if (curScreen === 'create-tx' || curScreen === 'add-from-ledger' || curScreen === 'landing' || curScreen === 'landing-add-from-ledger') {
        store.dispatch(ledger.actions.setWatch(true));
        store.dispatch(ledger.actions.watchConnection());
      } else {
        store.dispatch(ledger.actions.setWatch(false));
      }
    }
  });
}

waitForServices(() => {
  ipcRenderer.send('wallet-ready');
});
screenHandlers();
