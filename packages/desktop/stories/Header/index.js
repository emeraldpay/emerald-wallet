import React from 'react';
import { storiesOf } from '@storybook/react';
import Header from '../../src/components/layout/Header';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { fromJS } from 'immutable';
import { Wei } from '@emeraldplatform/emerald-js';

storiesOf('Header', module)
  .add('default', () => {
    const s = {
      wallet: {
        screen: fromJS({}),
      },
      accounts: fromJS({
        accounts: [
          {
            balance: Wei.Zero,
          },
        ],
      }),
      network: fromJS({
        peerCount: 10,
        currentBlock: {
          height: 120000,
        },
        sync: {
          highestBlock: 200000,
        },
      }),
      launcher: fromJS({
        connecting: false,
        chain: {
          id: 20080914,
          name: 'mainnet',
        },
        geth: {
          url: 'http://127.0.0.1:8545',
          id: 20080914,
          type: 'local',
        },
      }),
    };

    const store = createStore((state = s, action) => state);
    return (
      <Provider store={store}>
        <Header />
      </Provider>
    );
  })
  .add('connecting', () => {
    const s = {
      wallet: {
        screen: fromJS({}),
      },
      accounts: fromJS({
        accounts: [
          {
            balance: Wei.Zero,
          },
        ],
      }),
      network: fromJS({
        peerCount: 10,
        currentBlock: {
          height: 100000,
        },
        sync: {
          highestBlock: 200000,
        },
      }),
      launcher: fromJS({
        connecting: true,
        chain: {
          id: 20080914,
          name: 'mainnet',
        },
        geth: {
          url: 'http://127.0.0.1:8545',
          id: 20080914,
          type: 'local',
        },
      }),
    };

    const store = createStore((state = s, action) => state);
    return (
      <Provider store={store}>
        <Header />
      </Provider>
    );
  })
  .add('gas tracker', () => {
    const s = {
      wallet: {
        screen: fromJS({}),
      },
      accounts: fromJS({
        accounts: [
          {
            balance: Wei.Zero,
          },
        ],
      }),
      network: fromJS({
        peerCount: 10,
        currentBlock: {
          height: 100000,
        },
        sync: {
          highestBlock: 200000,
        },
      }),
      launcher: fromJS({
        connecting: true,
        chain: {
          id: 20080914,
          name: 'mainnet',
        },
        geth: {
          url: 'https://api.smilo.network',
          id: 20080914,
          type: 'remote',
        },
      }),
    };

    const store = createStore((state = s, action) => state);
    return (
      <Provider store={store}>
        <Header />
      </Provider>
    );
  });
