/* eslint-disable import/no-extraneous-dependencies */
import thunkMiddleware from 'redux-thunk';
import createReduxLogger from 'redux-logger';
import { createStore as createReduxStore, applyMiddleware, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { ipcRenderer } from 'electron';

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
    store.dispatch(history.actions.refreshTrackedTransactions()),
    store.dispatch(network.actions.loadHeight(false)),
  ];

  const state = store.getState();

  if (state.launcher.getIn(['geth', 'type']) === 'local') {
    promises = promises.concat([
      store.dispatch(network.actions.loadPeerCount()),
    ]);
  }

  return Promise.all(promises).then(() => {
    requestIdleCallback(refreshAll, { timeout: intervalRates.continueRefreshAllTxRate });
  });
}

function refreshLong() {
  store.dispatch(settings.actions.getExchangeRates())
    .then(() => {
      setTimeout(refreshLong, intervalRates.continueRefreshLongRate);
    });
}

const REFRESH_SYNCING_MAX_CHECKS = 100;
function refreshSyncing(syncingStarted = false, iteration = 0) {
  return store
    .dispatch(network.actions.loadSyncing())
    .then(({syncing}) => {
      iteration++;
      return new Promise((resolve, reject) => {
        if (syncing) {
          syncingStarted = true;
        } else if (syncingStarted) {
          const finishedSyncing = !syncing;

          if (finishedSyncing) {
            resolve(true);
            return;
          }
        }

        if (iteration < REFRESH_SYNCING_MAX_CHECKS || syncingStarted) {
          requestIdleCallback(
            () => refreshSyncing(syncingStarted, iteration).then(resolve)
          );
        } else {
          resolve(false);
        }
      });
    });
}

export function startSync() {
  const state = store.getState();

  const chain = state.launcher.getIn(['chain', 'name']);

  if (chain === 'mainnet') {
    store.dispatch(ledger.actions.setBaseHD("m/44'/60'/160720'/0'"));
  } else if (chain === 'morden') {
    // FIXME ledger throws "Invalid status 6804" for 44'/62'/0'/0
    store.dispatch(ledger.actions.setBaseHD("m/44'/61'/1'/0"));
  }

  const chainId = state.launcher.getIn(['chain', 'id']);

  const promiseChain = store.dispatch(network.actions.getGasPrice())
    .then(() => store.dispatch(loadClientVersion()))
    .then(() => store.dispatch(Addressbook.actions.loadAddressBook()))
    .then(() => store.dispatch(tokens.actions.loadTokenList()))
    .then(() => store.dispatch(history.actions.init(chainId)));

  if (state.launcher.getIn(['geth', 'type']) !== 'remote') {
    promiseChain.then(() => refreshSyncing());
  }

  // deployed tokens
  const known = deployedTokens[+chainId];

  if (known) {
    promiseChain.then(() => Promise.all(known.map((token) => store.dispatch(tokens.actions.addToken(token)))));
  }

  return promiseChain
    .then(refreshAll)
    .then(() => {
      // dispatch them in series
      const historyForAddress = (a) => {
        const params = [a.first().get('id'), 0, 0, '', '', -1, -1, false];
        return store.dispatch(network.actions.loadAddressTransactions(...params))
          .then(() => {
            if (a.size > 1) {
              historyForAddress(a.rest());
            }
          });
      };

      historyForAddress(store.getState().accounts.get('accounts'));
    })
    .then(() => store.dispatch(connecting(false)))
    .then(() => setTimeout(refreshLong, 3 * intervalRates.second));
}

function newWalletVersionCheck() {
  return getWalletVersion().then((versionDetails) => {
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
  newWalletVersionCheck();
};

export function waitForServices() {
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

waitForServices();
screenHandlers();
