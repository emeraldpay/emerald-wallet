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

import createLogger from '../utils/logger';

const log = createLogger('store');

const toJs = (state) => {
  const toJsState = {};
  for (const prop in state) {
    if (state[prop].toJS) {
      toJsState[prop] = state[prop].toJS();
    } else {
      toJsState[prop] = toJs(state[prop]);
    }
  }
  return toJsState;
};

const loggerMiddleware = createReduxLogger({
  stateTransformer: toJs,
  diff: true,
  collapsed: true,
  duration: true,
  timestamp: false,
  colors: {
    title: (action) => {
      if (action.type.indexOf('ACCOUNT') === 0) { return 'CadetBlue'; }
      if (action.type.indexOf('TOKEN') === 0) { return 'DarkGreen'; }
      if (action.type.indexOf('LAUNCHER') === 0) { return 'Indigo'; }
      if (action.type.indexOf('WALLET') === 0) { return 'LightSeaGreen'; }
      if (action.type.indexOf('NETWORK') === 0) { return 'SaddleBrown'; }
      if (action.type.indexOf('LEDGER') === 0) { return 'Tan'; }
      if (action.type.indexOf('SETTINGS') === 0) { return 'SandyBrown'; }
      if (action.type.indexOf('SCREEN') === 0) { return 'PowderBlue'; }

      // @@ convention for redux based libs
      if (action.type.indexOf('@@') === 0) { return 'LightGrey'; }
    },
  },
});

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
export const createStore = (_api) => createReduxStore(
  combineReducers(reducers),
  applyMiddleware(
    thunkMiddleware.withExtraArgument(_api),
    loggerMiddleware
  )
);

export const store = createStore(api);

function refreshAll() {
  store.dispatch(accounts.actions.loadPendingTransactions());
  store.dispatch(history.actions.refreshTrackedTransactions());
  store.dispatch(network.actions.loadHeight());
  store.dispatch(accounts.actions.loadAccountsList());

  const state = store.getState();
  if (state.launcher.getIn(['geth', 'type']) === 'local') {
    store.dispatch(network.actions.loadPeerCount());
    store.dispatch(network.actions.loadSyncing());
  }
  setTimeout(refreshAll, intervalRates.continueRefreshAllTxRate);
}

function refreshLong() {
  store.dispatch(settings.actions.getExchangeRates());
  setTimeout(refreshLong, intervalRates.continueRefreshLongRate);
}

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

  refreshAll();
  setTimeout(refreshLong, 3 * intervalRates.second);
  store.dispatch(connecting(false));
}

export function stopSync() {
  // TODO
}

export function start() {
  try {
    store.dispatch(readConfig());
    store.dispatch(settings.actions.loadSettings());
  } catch (e) {
    log.error(e);
  }
  store.dispatch(listenElectron());
  store.dispatch(screen.actions.gotoScreen('welcome'));
}

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
