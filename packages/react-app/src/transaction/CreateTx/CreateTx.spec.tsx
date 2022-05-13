import { Wei } from '@emeraldpay/bigamount-crypto';
import { workflow } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../_tests';
import CreateTx from './CreateTx';

describe('CreateTx', () => {
  it('it renders without crash', () => {
    const tx = new workflow.CreateEthereumTx();
    tx.amount = new Wei(1, 'ETHER');
    tx.totalBalance = new Wei(5, 'ETHER');
    tx.gas = new BigNumber(100000);
    tx.gasPrice = new Wei(0.0001, 'ETHER');

    const wrapper = shallow(
      <Provider store={createTestStore()}>
        <CreateTx
          token="ETH"
          tx={tx}
          txFeeToken="ETH"
          tokenSymbols={[]}
          eip1559={false}
          highGasPrice={{ expect: 100, max: 0, priority: 0 }}
          lowGasPrice={{ expect: 1, max: 0, priority: 0 }}
          stdGasPrice={{ expect: 50, max: 0, priority: 0 }}
        />
      </Provider>,
    );
    expect(wrapper).toBeDefined();

    const mounted = mount(
      <Provider store={createTestStore()}>
        <CreateTx
          token="ETH"
          tx={tx}
          txFeeToken="ETH"
          tokenSymbols={[]}
          eip1559={false}
          highGasPrice={{ expect: 100, max: 0, priority: 0 }}
          lowGasPrice={{ expect: 1, max: 0, priority: 0 }}
          stdGasPrice={{ expect: 50, max: 0, priority: 0 }}
        />
      </Provider>,
    );
    expect(mounted).toBeDefined();
  });
});
