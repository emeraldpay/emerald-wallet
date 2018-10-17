/* eslint-disable import/no-extraneous-dependencies */
import thunkMiddleware from 'redux-thunk';
import { createStore as createReduxStore, applyMiddleware, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { ipcRenderer } from 'electron';
import { startProtocolListener } from './protocol';

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

import { onceServicesStart, onceAccountsLoaded, onceHasAccountsWithBalances } from './triggers';

const log = createLogger('store');

const reducers = {
  accounts: accounts.reducer,
  addressBook: Addressbook.reducer,
  tokens: tokens.reducer,
  network: network.reducer,
  launcher: launcherReducers,
  ledger: ledger.reducer,
  form: formReducer,
  wallet: walletReducers,
};


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

export function startSync() {
  const state = store.getState();

  const promises = [
    store.dispatch(network.actions.getGasPrice()),
    store.dispatch(loadClientVersion()),
    store.dispatch(Addressbook.actions.loadAddressBook()),
    store.dispatch(tokens.actions.loadTokenList()),
  ];

  const chain = state.launcher.getIn(['chain', 'name']);

  if (chain === 'mainnet') {
    promises.push(store.dispatch(ledger.actions.setBaseHD("m/44'/60'/160720'/0'")));
  } else if (chain === 'morden') {
    // FIXME ledger throws "Invalid status 6804" for 44'/62'/0'/0
    promises.push(store.dispatch(ledger.actions.setBaseHD("m/44'/61'/1'/0")));
  }

  if (state.launcher.getIn(['geth', 'type']) !== 'remote') {
    // check for syncing
    setTimeout(() => store.dispatch(network.actions.loadSyncing()), intervalRates.second); // prod: intervalRates.second
    // double check for syncing
    setTimeout(() => store.dispatch(network.actions.loadSyncing()), 2 * intervalRates.minute); // prod: 30 * this.second
  }

  const chainId = state.launcher.getIn(['chain', 'id']);
  promises.push(store.dispatch(history.actions.init(chainId)));

  // deployed tokens
  const known = deployedTokens[+chainId];

  if (known) {
    known.forEach((token) => promises.push(store.dispatch(tokens.actions.addToken(token))));
  }

  setTimeout(refreshLong, 3 * intervalRates.second);

  promises.push(
    refreshAll()
      .then(() => store.dispatch(network.actions.loadAddressesTransactions(
        store.getState().accounts.get('accounts').map((account) => account.get('id'))
      )))
      .then(() => store.dispatch(connecting(false)))
  );

  return Promise.all(promises);
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
  getInitialScreen();
  newWalletVersionCheck();
};

function checkStatus() {
  function checkServiceStatus() {
    // hack to make some stuff work in storybook: @shanejonas
    if (!ipcRenderer) {
      return;
    }
    ipcRenderer.send('get-status');
  }

  setTimeout(checkServiceStatus, 2000);
}

export function screenHandlers() {
  let prevScreen = null;
  store.subscribe(() => {
    const state = store.getState();
    const curScreen = state.wallet.screen.get('screen');
    const justOpened = prevScreen !== curScreen;
    prevScreen = curScreen;
    if (justOpened) {
      if (curScreen === 'create-tx' || curScreen === 'add-from-ledger' || curScreen === 'landing-add-from-ledger') {
        store.dispatch(ledger.actions.setWatch(true));
        store.dispatch(ledger.actions.watchConnection());
      } else {
        store.dispatch(ledger.actions.setWatch(false));
      }
    }
  });
}

startProtocolListener(store);

function getInitialScreen() {
  // First things first, always go to welcome screen. This shows a nice spinner
  store.dispatch(screen.actions.gotoScreen('welcome'));

  if (store.getState().launcher.get('firstRun') === true) {
    return; // stay on the welcome screen.
  }

  return onceAccountsLoaded(store).then(() => {
    const accountSize = store.getState().accounts.get('accounts').size;

    if (accountSize === 0) {
      return store.dispatch(screen.actions.gotoScreen('landing'));
    }

    return onceHasAccountsWithBalances(store).then(() => {
      return store.dispatch(screen.actions.gotoScreen('home'));
    });
  });
}

onceServicesStart(store).then(startSync);
checkStatus();
screenHandlers();
