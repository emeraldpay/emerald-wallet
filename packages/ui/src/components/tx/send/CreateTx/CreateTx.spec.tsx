import * as React from 'react';
import { shallow, mount } from 'enzyme';
import CreateTx from './CreateTx';


describe('CreateTx', () => {
  it('it renders without crash', () => {
    const wrapper = shallow(
      <CreateTx
        token="ETH"
        txFee="1000000"
        txFeeToken="ETH"
        gasLimit="1000000"
        amount="1"
        balance="5"
      />);
    expect(wrapper).toBeDefined();

    const mounted = mount(<CreateTx
      token="ETH"
      txFee="1000000"
      txFeeToken="ETH"
      gasLimit="1000000"
      amount="1"
      balance="5"
    />);
    expect(mounted).toBeDefined();
  });
});
