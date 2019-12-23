import { shallow } from 'enzyme';
import * as React from 'react';
import AccountShow from './WalletDetailsView';

describe('AccountDetailsView', () => {
  it('Shows HD path for hardware account', () => {
    const account = {
      blockchain: 'etc',
      hardware: true,
      hdpath: 'HD/PATH',
      id: '0x1234'
    };
    const wrapper = shallow(<AccountShow showFiat={false} account={account}/>);
    expect(wrapper).toBeDefined();
  });
});
