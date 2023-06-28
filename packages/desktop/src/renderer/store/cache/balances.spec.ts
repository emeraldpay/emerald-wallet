import { IEmeraldVault, Wallet } from '@emeraldpay/emerald-vault-core';
import { BackendApi, PersistentState, TokenData, WalletApi } from '@emeraldwallet/core';
import { accounts, application, createStore, triggers } from '@emeraldwallet/store';
import { Action, Unsubscribe } from 'redux';
import { initBalancesState } from './balances';

interface ApiMock {
  balances: PersistentState.Balances;
  vault: Partial<IEmeraldVault>;
}

jest.mock('electron', () => ({
  ipcRenderer: {
    invoke: jest.fn(async () => Promise.resolve()),
    send: jest.fn(),
  },
}));

const tokens: TokenData[] = [
  {
    name: 'Tether USD',
    blockchain: 100,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    decimals: 6,
    type: 'ERC20',
    stablecoin: true,
  },
];

const apiMock: ApiMock = {
  balances: {
    list(address: PersistentState.Address | PersistentState.XPub): Promise<PersistentState.Balance[]> {
      if (address === 'xpub') {
        return Promise.resolve([
          {
            address: 'bc1',
            amount: '100000000',
            asset: 'BTC',
            blockchain: 1,
          },
        ]);
      }

      return Promise.resolve([
        {
          address: '0x0',
          amount: '1000000000000000000',
          asset: 'ETHER',
          blockchain: 100,
        },
        {
          address: '0x0',
          amount: '1000000',
          asset: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          blockchain: 100,
        },
      ]);
    },
    set() {
      return Promise.resolve(true);
    },
  },
  vault: {
    listWallets(): Promise<Wallet[]> {
      return Promise.resolve([
        {
          id: '7d395b44-0bac-49b9-98de-47e88dbc5a28',
          entries: [
            {
              id: '7d395b44-0bac-49b9-98de-47e88dbc5a28-0',
              address: {
                type: 'single',
                value: 'xpub',
              },
              key: {
                type: 'hd-path',
                hdPath: "m/84'",
                seedId: '2b4a8ad4-a3ea-446b-b0a3-ce1a5b75dca6',
              },
              blockchain: 1,
              createdAt: new Date(),
              xpub: [
                {
                  role: 'change',
                  xpub: 'xpub',
                },
              ],
            },
          ],
          createdAt: new Date(),
        },
        {
          id: '50391c5d-a517-4b7a-9c42-1411e0603d30',
          entries: [
            {
              id: '50391c5d-a517-4b7a-9c42-1411e0603d30-0',
              address: {
                type: 'single',
                value: '0x0',
              },
              key: {
                type: 'hd-path',
                hdPath: "m/44'",
                seedId: 'c782ff2b-ba6e-43e2-9e2d-92d05cc37b03',
              },
              blockchain: 100,
              createdAt: new Date(),
            },
          ],
          createdAt: new Date(),
        },
      ]);
    },
  },
};

describe('balances cache', () => {
  const store = createStore(apiMock as WalletApi, {} as BackendApi);

  store.dispatch(application.actions.setTokens(tokens, true) as unknown as Action);

  let unsubscribe: Unsubscribe | undefined;

  const onceInitDetails = (): Promise<void> =>
    new Promise((resolve) => {
      unsubscribe = store.subscribe(() => {
        const {
          accounts: { details },
        } = store.getState();

        if (details.length > 0) {
          resolve();
        }
      });
    });

  afterAll(() => unsubscribe?.());

  it('should write cached balances to store', async () => {
    store.dispatch(accounts.actions.loadWalletsAction());

    await triggers.onceAccountsLoaded(store);

    initBalancesState(apiMock as WalletApi, store);

    await onceInitDetails();

    const {
      accounts: { details },
    } = store.getState();

    expect(details.length).toBe(2);

    const btcBalance = details.find((detail) => detail.address === 'bc1');
    const ethBalance = details.find((detail) => detail.address === '0x0');

    expect(btcBalance?.balance).toBe('100000000/SAT');
    expect(ethBalance?.balance).toBe('1000000000000000000/WEI');
  });
});
