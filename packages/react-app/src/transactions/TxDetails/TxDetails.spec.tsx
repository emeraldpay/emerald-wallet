import { BlockchainCode } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Observable, Store } from 'redux';
import { default as TxDetails } from './TxDetails';

function createStore(): Store {
  return {
    [Symbol.observable](): Observable<undefined> {
      return undefined;
    },
    dispatch: undefined,
    getState() {
      return {
        accounts: {
          wallets: [
            {
              id: '111',
              entries: [
                {
                  blockchain: 101,
                },
              ],
            },
          ],
        },
        history: {
          transactions: new Map(
            Object.entries({
              '0x95c1767c33c37ef93de48897c1001679d947bd7f082fdf4e772c534ae180b9c8': {
                blockchain: BlockchainCode.ETC,
                hash: '0x95c1767c33c37ef93de48897c1001679d947bd7f082fdf4e772c534ae180b9c8',
                data: '0xDADA',
                from: '0x1234',
                to: '0x9876',
                gas: 21000,
                gasPrice: new BigNumber('30000000000'),
                value: new BigNumber('100999370000000000000'),
              },
              '01679d947bd7f082fdf4e772c534ae1895c1767c33c37ef93de48897c100b9c8': {
                blockchain: BlockchainCode.BTC,
                hash: '01679d947bd7f082fdf4e772c534ae1895c1767c33c37ef93de48897c100b9c8',
                fee: 21000,
                inputs: [],
                outputs: [],
              },
            }),
          ),
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

describe('TxDetailsView', () => {
  it('should render nested components correctly', () => {
    const component = mount(
      <Provider store={createStore()}>
        <TxDetails hash={'0x95c1767c33c37ef93de48897c1001679d947bd7f082fdf4e772c534ae180b9c8'} />
      </Provider>,
    );

    expect(component).toBeDefined();
  });

  it('should show tx input data', () => {
    const component = mount(
      <Provider store={createStore()}>
        <TxDetails hash={'0x95c1767c33c37ef93de48897c1001679d947bd7f082fdf4e772c534ae180b9c8'} />
      </Provider>,
    );

    expect(component).toBeDefined();
  });

  it('should render bitcoin tx', () => {
    const component = mount(
      <Provider store={createStore()}>
        <TxDetails hash={'01679d947bd7f082fdf4e772c534ae1895c1767c33c37ef93de48897c100b9c8'} />
      </Provider>,
    );

    expect(component).toBeDefined();
  });
});
