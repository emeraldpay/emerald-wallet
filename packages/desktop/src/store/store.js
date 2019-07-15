/* eslint-disable import/no-extraneous-dependencies */
import {
  blockchains,
  screen,
  ledger,
  txhistory,
  addresses,
} from '@emeraldwallet/store';
import { ipcRenderer } from 'electron';
import { startProtocolListener } from './protocol';

import { Api, getConnector } from '../lib/rpc/api';
import { intervalRates } from './config';
import settings from './wallet/settings';
import tokens from './vault/tokens';
import Addressbook from './vault/addressbook';

import {
  readConfig,
  listenElectron,
  connecting
} from './launcher/launcherActions';
// import { showError } from './wallet/screen/screenActions';

import getWalletVersion from '../utils/get-wallet-version';
import createLogger from '../utils/logger';
import { createStore } from './createStore';

import {
  onceServicesStart,
  onceAccountsLoaded,
  onceHasAccountsWithBalances,
  onceModeSet,
} from './triggers';

const log = createLogger('store');

const api = new Api(getConnector());
export const store = createStore(api);
global.api = api;

function refreshAll() {
  const promises = [
    // store.dispatch(accounts.actions.loadPendingTransactions()), // TODO: Fix it
    store.dispatch(addresses.actions.loadAccountsList()),
  ];

  // Main loop that will refresh UI as needed
  setTimeout(refreshAll, intervalRates.continueRefreshAllTxRate);

  return Promise.all(promises);
}

export function startSync() {
  log.info('Start synchronization');
  store.dispatch(settings.actions.listenPrices());

  const promises = [
    // store.dispatch(history.actions.refreshTrackedTransactions()),
  ];

  promises.push(
    onceModeSet(store).then(() => {
      const loadAllChain = [];
      const supported = settings.selectors.currentChains(store.getState());
      const codes = supported.map((chain) => chain.params.coinTicker.toLowerCase());
      log.info('Configured to use chains', codes);

      store.dispatch(txhistory.actions.init(codes));
      api.connectChains(codes);

      supported.forEach((chain) => {
        // const {chainId} = chain.params;
        const chainCode = chain.params.coinTicker.toLowerCase();
        const loadChain = [];
        // request tokens
        // loadChain.push(store.dispatch(tokens.actions.loadTokenList(chainCode)));
        // loadChain.push(store.dispatch(tokens.actions.addDefault(chainCode, chainId)));
        // address book
        loadChain.push(store.dispatch(Addressbook.actions.loadAddressBook(chainCode)));
        // request gas price for each chain
        loadChain.push(store.dispatch(blockchains.actions.fetchGasPriceAction(chainCode)));
        loadAllChain.push(
          Promise.all(loadChain)
            .catch((e) => log.error(`Failed to load chain ${chainCode}`, e))
        );
      });
      return Promise.all(loadAllChain).catch((e) => log.error('Failed to load chains', e));
    })
  );

  promises.push(
    refreshAll()
      .then(() => store.dispatch(connecting(false)))
      .catch((err) => {
        log.error('Failed to do initial sync', err);
        store.dispatch(screen.actions.showError(err));
      })
  );
  return Promise.all(promises)
    .then(() => log.info('Initial synchronization finished'))
    .catch((e) => log.error('Failed to start synchronization', e));
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

export function electronToStore() {
  return (dispatch) => {
    log.debug('Running launcher listener for Redux');
    ipcRenderer.on('store', (event, action) => {
      log.debug(`Got from IPC event: ${event} action: ${JSON.stringify(action)}`);
      dispatch(action);
    });
  };
}

export const start = () => {
  try {
    store.dispatch(readConfig());
    store.dispatch(settings.actions.loadSettings());
  } catch (e) {
    log.error(e);
  }
  store.dispatch(listenElectron());
  store.dispatch(electronToStore());
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
    const curScreen = screen.selectors.getCurrentScreen(state).screen;
    const justOpened = prevScreen !== curScreen && typeof curScreen === 'string';
    prevScreen = curScreen;
    if (justOpened) {
      if (
        curScreen === 'create-tx'
        || curScreen === 'add-from-ledger'
        || curScreen === 'landing-add-from-ledger'
      ) {
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

  return onceAccountsLoaded(store).then(() => {
    const accountSize = addresses.selectors.all(store.getState()).size;

    if (accountSize === 0) {
      return store.dispatch(screen.actions.gotoScreen('landing'));
    }

    return onceHasAccountsWithBalances(store).then(() => {
      return store.dispatch(screen.actions.gotoScreen('home'));
    });
  });
}

Promise
  .all([onceServicesStart(store)])
  .then(startSync);
checkStatus();
screenHandlers();
ipcRenderer.send('emerald-ready');
