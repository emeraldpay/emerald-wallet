import {workflow} from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import {mount, shallow} from 'enzyme';
import * as React from 'react';
import CreateTx from './CreateTx';
import {Wei} from '@emeraldpay/bigamount-crypto';
import {Provider} from "react-redux";
import {createTestStore} from "../../_tests";

describe('CreateTx', () => {
  it('it renders without crash', () => {
    const tx = new workflow.CreateEthereumTx();
    tx.amount = new Wei(1, "ETHER");
    tx.totalBalance = new Wei(5, "ETHER");
    tx.gas = new BigNumber(100000);
    tx.gasPrice = new Wei(0.0001, "ETHER");

    const wrapper = shallow(
      <Provider store={createTestStore()}>
        <CreateTx
          token='ETH'
          tx={tx}
          txFeeToken='ETH'
          tokenSymbols={[]}
        />
      </Provider>
      );
    expect(wrapper).toBeDefined();

    const mounted = mount(
      <Provider store={createTestStore()}>
        <CreateTx
          token='ETH'
          tx={tx}
          txFeeToken='ETH'
          tokenSymbols={[]}
        />
      </Provider>
      );
    expect(mounted).toBeDefined();
  });
});
