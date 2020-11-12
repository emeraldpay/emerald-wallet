/* eslint-disable import/no-extraneous-dependencies */
import {
  BackendApi,
  blockchains,
  screen,
  txhistory,
  accounts,
  addressBook,
  settings,
  application,
  createStore,
  RemoteVault,
  RenderWalletState,
  triggers,
  config
} from '@emeraldwallet/store';
import {ipcRenderer} from 'electron';
import getWalletVersion from '../utils/get-wallet-version';
import {Logger} from '@emeraldwallet/core';
import ElectronLogger from '../utils/logger2';

Logger.setInstance(new ElectronLogger());

const log = Logger.forCategory('store');

const api = {vault: RemoteVault};
const backendApi = new BackendApi();
const walletState = new RenderWalletState();

export const store = createStore(api, backendApi, walletState);
global.api = api;

function refreshAll() {
  const promises = [
    // store.dispatch(accounts.actions.loadPendingTransactions()), // TODO: Fix it
    // store.dispatch(addresses.actions.loadAccountsList()),
  ];

  // Main loop that will refresh UI as needed
  setTimeout(refreshAll, config.intervalRates.continueRefreshAllTxRate);

  return Promise.all(promises);
}

export function startSync() {
  log.info('Start synchronization');
  const promises = [];

  promises.push(
    triggers.onceModeSet(store)
      .then(() => {
        const supported = settings.selectors.currentChains(store.getState());
        const codes = supported.map((chain) => chain.params.code);
        log.info('Configured to use chains', codes);
      })
      .then(() => {
        return store.dispatch(accounts.actions.loadSeedsAction());
      })
      .then(() => {
        return store.dispatch(accounts.actions.loadWalletsAction());
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
function listenElectron() {
  return (dispatch) => {
    log.debug('Running launcher listener for Redux');
    ipcRenderer.on('store', (event, action) => {
      log.debug(`Got from IPC event: ${event} action: ${JSON.stringify(action)}`);
      dispatch(action);

      // for bitcoin check utxo and create missing tx in history
      // TODO remove once we have an api to get history
      if (action.type === "ACCOUNT/SET_BALANCE") {
        if (typeof action.payload === "object" &&
          typeof action.payload.utxo === "object" &&
          action.payload.utxo.length > 0 &&
          typeof action.payload.entryId === "string") {
          let state = store.getState();
          let entry = accounts.selectors.findEntry(state, action.payload.entryId);
          dispatch({
            type: "WALLET/HISTORY/BALANCE_TX",
            entry: entry,
            balance: action.payload
          })
        }
      }
    });
  };
}

export const start = () => {
  try {
    store.dispatch(application.actions.readConfig());
    store.dispatch(settings.actions.loadSettings());
    store.dispatch(listenElectron());
  } catch (e) {
    log.error(e);
  }
  getInitialScreen();
  newWalletVersionCheck();
};

function getInitialScreen() {
  // First things first, always go to welcome screen. This shows a nice spinner
  store.dispatch(screen.actions.gotoScreen('welcome'));

  return triggers.onceServicesStart(store)
    .then(() => triggers.onceModeSet(store)
      .then(() => triggers.onceAccountsLoaded(store)
        .then(() => {
          log.info('Opening Home screen');
          // We display home screen which will decide show landing or wallets list
          store.dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
        })));
}

Promise
  .all([triggers.onceBlockchainConnected(store)])
  .then(startSync);

ipcRenderer.send('emerald-ready');
