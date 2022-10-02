import { Logger, WalletApi } from '@emeraldwallet/core';
import {
  BackendApi,
  RemoteAddressBook,
  RemoteTxHistory,
  RemoteTxMeta,
  RemoteVault,
  RemoteXPubPosition,
  accounts,
  addressBook,
  application,
  createStore,
  screen,
  settings,
  triggers,
} from '@emeraldwallet/store';
import { ipcRenderer } from 'electron';
import * as ElectronLogger from 'electron-log';
import { AnyAction } from 'redux';
import checkUpdate from '../../main/utils/check-update';
import updateOptions from '../../main/utils/update-options';

Logger.setInstance(ElectronLogger);

const logger = Logger.forCategory('store');

const api: WalletApi = {
  addressBook: RemoteAddressBook,
  txHistory: RemoteTxHistory,
  txMeta: RemoteTxMeta,
  vault: RemoteVault,
  xPubPos: RemoteXPubPosition,
};

const backendApi = new BackendApi();

export const store = createStore(api, backendApi);

function listenElectron(): void {
  logger.debug('Running launcher listener for Redux');

  ipcRenderer.on('store', (event, action) => {
    logger.debug(`Got from IPC, event: ${event}, action: ${JSON.stringify(action)}`);

    store.dispatch(action);

    // TODO remove once we have an api to get history
    if (
      action.type === 'ACCOUNT/SET_BALANCE' &&
      action.payload?.entryId != null &&
      (action.payload?.utxo?.length ?? 0) > 0
    ) {
      const state = store.getState();
      const entry = accounts.selectors.findEntry(state, action.payload.entryId);

      store.dispatch({
        balance: action.payload,
        entry: entry,
        type: 'WALLET/HISTORY/BALANCE_TX',
      });
    }
  });
}

function getInitialScreen(): void {
  store.dispatch(screen.actions.gotoScreen('welcome'));

  triggers.onceServicesStart(store).then(() =>
    triggers.onceModeSet(store).then(() =>
      triggers.onceAccountsLoaded(store).then(() =>
        RemoteVault.getOddPasswordItems().then((oddPasswordItems) => {
          if (oddPasswordItems.length > 0) {
            store.dispatch(screen.actions.gotoScreen(screen.Pages.PASSWORD_MIGRATION));
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            store.dispatch(screen.actions.gotoWalletsScreen() as any);
          }
        }),
      ),
    ),
  );
}

function checkOptionsUpdates(): void {
  updateOptions().then((options) => {
    store.dispatch(application.actions.setOptions(options));
  });
}

function checkWalletUpdates(): void {
  checkUpdate().then((versionDetails) => {
    if (!versionDetails.isLatest) {
      store.dispatch(
        screen.actions.showNotification(
          `A new version of Emerald Wallet is available (${versionDetails.tag}).`,
          'info',
          20 * 1000,
          'Update',
          screen.actions.openLink(versionDetails.downloadLink),
        ),
      );
    }
  });
}

function startSync(): void {
  logger.info('Start synchronization');

  triggers
    .onceModeSet(store)
    .then(() => {
      const supported = settings.selectors.currentChains(store.getState());
      const codes = supported.map((chain) => chain.params.code);

      logger.info('Configured to use chains', codes);

      return store.dispatch(accounts.actions.loadSeedsAction());
    })
    .then(() => store.dispatch(accounts.actions.loadWalletsAction()))
    .then(() => {
      const supported = settings.selectors.currentChains(store.getState());

      const loadChains = supported.map(async (blockchain) => {
        await store.dispatch(addressBook.actions.loadLegacyAddressBook(blockchain.params.code));
        await store.dispatch(addressBook.actions.loadAddressBook(blockchain.params.code));
      });

      return Promise.all(loadChains).catch((exception) => logger.error('Failed to load chains', exception));
    })
    .then(() => {
      logger.info('Initial synchronization finished');

      store.dispatch(application.actions.connecting(false));
    })
    .catch((exception) => logger.error('Failed to start synchronization', exception));
}

export function startStore(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.dispatch(application.actions.readConfig() as any);
    store.dispatch(settings.actions.loadSettings());

    listenElectron();
  } catch (exception) {
    logger.error(exception);
  }

  getInitialScreen();
  checkOptionsUpdates();
  checkWalletUpdates();
}

triggers.onceBlockchainConnected(store).then(startSync);

ipcRenderer.send('emerald-ready');
