import { BlockchainCode, PersistentState, TokenRegistry, blockchainCodeToId } from '@emeraldwallet/core';
import { StoredTransaction } from '@emeraldwallet/store';
import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/core';
import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { default as TxDetails } from './TxDetails';

const { ChangeType, Direction, State, Status } = PersistentState;

function createStore(): Store {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Symbol.observable](): any {
      return undefined;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatch(): any {
      return () => undefined;
    },
    getState() {
      return {
        history: {
          transactions: [],
        },
      };
    },
    replaceReducer(): void {
      // Nothing
    },
    subscribe() {
      return () => undefined;
    },
  };
}

const tokenRegistry = new TokenRegistry([]);

const ethereumTx = new StoredTransaction(
  tokenRegistry,
  {
    blockchain: blockchainCodeToId(BlockchainCode.ETH),
    changes: [
      {
        amount: '-100000',
        asset: 'ETH',
        direction: Direction.SPEND,
        type: ChangeType.TRANSFER,
        wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
      },
    ],
    sinceTimestamp: new Date('2022-01-01T10:00:00'),
    state: State.PREPARED,
    status: Status.UNKNOWN,
    txId: '0x95c1767c33c37ef93de48897c1001679d947bd7f082fdf4e772c534ae180b9c8',
  },
  null,
);

const bitcoinTx = new StoredTransaction(
  tokenRegistry,
  {
    blockchain: blockchainCodeToId(BlockchainCode.BTC),
    changes: [
      {
        amount: '-100000',
        asset: 'BTC',
        direction: Direction.SPEND,
        type: ChangeType.TRANSFER,
        wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
      },
    ],
    sinceTimestamp: new Date('2022-01-01T10:00:00'),
    state: State.PREPARED,
    status: Status.UNKNOWN,
    txId: '01679d947bd7f082fdf4e772c534ae1895c1767c33c37ef93de48897c100b9c8',
  },
  null,
);

describe('TxDetailsView', () => {
  it('should render ethereum tx', () => {
    expect(
      mount(
        <ThemeProvider theme={Theme}>
          <Provider store={createStore()}>
            <TxDetails tx={ethereumTx} />
          </Provider>
        </ThemeProvider>,
      ),
    ).toBeDefined();
  });

  it('should render bitcoin tx', () => {
    expect(
      mount(
        <ThemeProvider theme={Theme}>
          <Provider store={createStore()}>
            <TxDetails tx={bitcoinTx} />
          </Provider>
        </ThemeProvider>,
      ),
    ).toBeDefined();
  });
});
