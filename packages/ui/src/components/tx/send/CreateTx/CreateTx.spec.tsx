import * as React from 'react';
import { shallow, mount } from 'enzyme';
import CreateTx from './CreateTx';
import { Wei, Units } from '@emeraldplatform/eth';

describe('CreateTx', () => {
  it('it renders without crash', () => {
    const amount = new Wei(1, Units.ETHER);
    const balance = new Wei(5, Units.ETHER);
    const fee = new Wei(0.01, Units.ETHER);

    const wrapper = shallow(
      <CreateTx
        token="ETH"
        txFee={fee}
        txFeeToken="ETH"
        gasLimit="1000000"
        amount={amount}
        balance={balance}
      />);
    expect(wrapper).toBeDefined();

    const mounted = mount(<CreateTx
      token="ETH"
      txFee={fee}
      txFeeToken="ETH"
      gasLimit="1000000"
      amount={amount}
      balance={balance}
    />);
    expect(mounted).toBeDefined();
  });
});
