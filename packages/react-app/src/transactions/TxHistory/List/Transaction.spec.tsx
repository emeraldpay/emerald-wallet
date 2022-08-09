import { BlockchainCode, blockchainCodeToId, PersistentState } from '@emeraldwallet/core';
import { StoredTransaction } from '@emeraldwallet/store';
import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/styles';
import { render } from '@testing-library/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Observable, Store } from 'redux';
import Transaction from './Transaction';

const { ChangeType, Direction, State, Status } = PersistentState;

function createStore(): Store {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Symbol.observable](): Observable<any> {
      return undefined;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatch(): any {
      return () => undefined;
    },
    getState() {
      return {
        accounts: {
          wallets: [],
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

const tx = new StoredTransaction({
  blockchain: blockchainCodeToId(BlockchainCode.ETH),
  changes: [
    {
      type: ChangeType.TRANSFER,
      amount: '-100001',
      direction: Direction.SPEND,
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
      asset: 'ETH',
    },
  ],
  sinceTimestamp: new Date('2021-01-05T10:11:12'),
  state: State.PREPARED,
  status: Status.UNKNOWN,
  txId: '0x5ec823816f186928c4ab6baae7cc80a837665d9096e0045d4f5d14cf076eb7b5',
});

describe('Transaction', () => {
  it('should renders without crash', () => {
    const component = render(
      <Provider store={createStore()}>
        <ThemeProvider theme={Theme}>
          <Transaction tx={tx} />
        </ThemeProvider>
        ,
      </Provider>,
    );

    expect(component).toBeDefined();
  });
});
