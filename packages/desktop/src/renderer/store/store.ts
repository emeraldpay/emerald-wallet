import { WalletEntry, isBitcoinEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { Coin, IpcCommands, Logger, PersistentState, SettingsOptions, TokenData, WalletApi } from '@emeraldwallet/core';
import {
  BackendApiInvoker,
  RemoteAddressBook,
  RemoteBalances,
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
  tokens,
  triggers,
} from '@emeraldwallet/store';
import { ipcRenderer } from 'electron';
import * as ElectronLogger from 'electron-log';
import checkUpdate from '../../main/utils/check-update';
import updateOptions from '../../main/utils/update-options';
import updateTokens from '../../main/utils/update-tokens';

type Balances = {
  coinBalances: PersistentState.Balance[];
  tokenBalances: PersistentState.Balance[];
};

Logger.setInstance(ElectronLogger);

const logger = Logger.forCategory('Store');

const api: WalletApi = {
  addressBook: RemoteAddressBook,
  balances: RemoteBalances,
  txHistory: RemoteTxHistory,
  txMeta: RemoteTxMeta,
  vault: RemoteVault,
  xPubPos: RemoteXPubPosition,
};

const backendApi = new BackendApiInvoker();

export const store = createStore(api, backendApi);

function listenElectron(): void {
  logger.debug('Running launcher listener for Redux');

  ipcRenderer.on(IpcCommands.STORE_DISPATCH, (event, action) => {
    logger.debug(`Got action from IPC: ${JSON.stringify(action)}`);

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
  store.dispatch(screen.actions.gotoScreen(screen.Pages.WELCOME));

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

function checkOptionsUpdates(stored: SettingsOptions): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateOptions(stored).then((options) => store.dispatch(application.actions.setOptions(options) as any));
}

function checkTokensUpdates(stored: TokenData[]): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateTokens(stored).then((tokens) => store.dispatch(application.actions.setTokens(tokens) as any));
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

  triggers.onceModeSet(store).then(() => {
    const blockchains = settings.selectors.currentChains(store.getState());

    logger.info(`Configured to use blockchains: ${blockchains.map((chain) => chain.params.code).join(', ')}`);

    store.dispatch(accounts.actions.loadSeedsAction());
    store.dispatch(accounts.actions.loadWalletsAction());

    const loadChains = blockchains.map(async (blockchain) => {
      await store.dispatch(addressBook.actions.loadLegacyAddressBook(blockchain.params.code));
      await store.dispatch(addressBook.actions.loadAddressBook(blockchain.params.code));
    });

    Promise.all(loadChains).catch((exception) => logger.error('Failed to load chains', exception));

    logger.info('Initial synchronization finished');

    store.dispatch(application.actions.connecting(false));
  });
}

function initState(): void {
  const entries = accounts.selectors.allEntries(store.getState());

  const entryByIdentifier = entries.reduce((carry, entry) => {
    if (isEthereumEntry(entry)) {
      const { address } = entry;

      if (address != null) {
        const list = carry.get(address.value) ?? [];

        return carry.set(address.value, [...list, entry]);
      }
    }

    if (isBitcoinEntry(entry)) {
      return entry.xpub.reduce<typeof carry>((xPubCarry, { xpub }) => {
        const list = xPubCarry.get(xpub) ?? [];

        return xPubCarry.set(xpub, [...list, entry]);
      }, carry);
    }

    return carry;
  }, new Map<string, WalletEntry[]>());

  Promise.all(
    [...entryByIdentifier.keys()].map(
      async (identifier) => ({ identifier, balances: await RemoteBalances.list(identifier) }),
      {},
    ),
  ).then((balances) => {
    const balanceByIdentifier = balances.reduce<Record<string, PersistentState.Balance[]>>(
      (carry, { identifier, balances }) => ({ ...carry, [identifier]: balances }),
      {},
    );

    const { coinBalances, tokenBalances } = Object.values(balanceByIdentifier)
      .flat()
      .reduce<Balances>(
        (carry, balance) => {
          if (balance.asset in Coin) {
            return { ...carry, coinBalances: [...carry.coinBalances, balance] };
          }

          return { ...carry, tokenBalances: [...carry.tokenBalances, balance] };
        },
        { coinBalances: [], tokenBalances: [] },
      );

    const entryByAddress = Object.entries(balanceByIdentifier).reduce<Record<string, WalletEntry[]>>(
      (carry, [identifier, balances]) => {
        return balances.reduce(
          (balancesCarry, balance) => ({ ...balancesCarry, [balance.address]: entryByIdentifier.get(identifier) }),
          carry,
        );
      },
      {},
    );

    store.dispatch(accounts.actions.initState(coinBalances, entryByAddress));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.dispatch(tokens.actions.initState(tokenBalances) as any);
  });
}

triggers.onceAccountsLoaded(store).then(initState);
triggers.onceBlockchainConnected(store).then(startSync);

export function startStore(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.dispatch(application.actions.readConfig() as any).then(() => {
      const { options = {}, tokens = [] } = store.getState().application;

      checkOptionsUpdates(options);
      checkTokensUpdates(tokens);
    });

    store.dispatch(settings.actions.loadSettings());

    listenElectron();
  } catch (exception) {
    logger.error(exception);
  }

  getInitialScreen();
  checkWalletUpdates();
}

ipcRenderer.send(IpcCommands.EMERALD_READY);
