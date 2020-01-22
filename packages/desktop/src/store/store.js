/* eslint-disable import/no-extraneous-dependencies */
import {
  blockchains,
  screen,
  ledger,
  txhistory,
  addresses,
  addressBook,
  settings,
  application
} from '@emeraldwallet/store';
import {ipcRenderer} from 'electron';
import {startProtocolListener} from './protocol';

import {Api, getConnector} from '../lib/rpc/api';
import {intervalRates} from './config';
// import { showError } from './wallet/screen/screenActions';

import getWalletVersion from '../utils/get-wallet-version';
import {createStore} from './createStore';

import {
  onceBlockchainConnected,
  onceAccountsLoaded,
  onceBalancesSet,
  onceModeSet, onceServicesStart,
} from './triggers';
import {Logger} from '@emeraldwallet/core';
import ElectronLogger from '../utils/logger2';

Logger.setInstance(new ElectronLogger());

const log = Logger.forCategory('store');

const api = new Api(getConnector());
export const store = createStore(api);
global.api = api;

function refreshAll() {
  const promises = [
    // store.dispatch(accounts.actions.loadPendingTransactions()), // TODO: Fix it
    // store.dispatch(addresses.actions.loadAccountsList()),
  ];

  // Main loop that will refresh UI as needed
  setTimeout(refreshAll, intervalRates.continueRefreshAllTxRate);

  return Promise.all(promises);
}

export function startSync() {
  log.info('Start synchronization');
  const promises = [];

  promises.push(
    onceModeSet(store)
      .then(() => {
        const supported = settings.selectors.currentChains(store.getState());
        const codes = supported.map((chain) => chain.params.code);
        log.info('Configured to use chains', codes);

        api.connectChains(codes);
      })
      .then(() => {
        return store.dispatch(addresses.actions.loadWalletsAction());
      })
      .then(() => {
        const supported = settings.selectors.currentChains(store.getState());
        const codes = supported.map((chain) => chain.params.code);

        const loadAllChain = [];
        supported.forEach((chain) => {
          // const {chainId} = chain.params;
          const chainCode = chain.params.code;
          const loadChain = [];

          // address book
          loadChain.push(store.dispatch(addressBook.actions.loadAddressBook(chainCode)));
          // request gas price for each chain
          loadChain.push(store.dispatch(blockchains.actions.fetchGasPriceAction(chainCode)));
          loadAllChain.push(
            Promise.all(loadChain)
              .catch((e) => log.error(`Failed to load chain ${chainCode}`, e))
          );
        });

        store.dispatch(txhistory.actions.init(codes));
        store.dispatch(txhistory.actions.refreshTrackedTransactions());

        return Promise.all(loadAllChain).catch((e) => log.error('Failed to load chains', e));
      })
  );

  promises.push(
    refreshAll()
      .then(() => store.dispatch(application.actions.connecting(false)))
      .catch((err) => {
        log.error('Failed to do initial sync', err);
        store.dispatch(screen.actions.showError(err));
      })
  );
  return Promise.all(promises)
    .then(() => log.info('Initial synchronization finished'))
    .catch((e) => log.error('Failed to start synchronization', e));
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

/**
 * Listen to IPC channel 'store' and dispatch action to redux store
 */
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
    store.dispatch(application.actions.readConfig());
    store.dispatch(settings.actions.loadSettings());
  } catch (e) {
    log.error(e);
  }
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

  return onceServicesStart(store)
    .then(() => onceAccountsLoaded(store)
      .then(() => {
        log.info('Opening Home screen');
        // We display home screen which will decide show landing or accounts list
        store.dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
      }));
}

Promise
  .all([onceBlockchainConnected(store)])
  .then(startSync);
checkStatus();
screenHandlers();
ipcRenderer.send('emerald-ready');
