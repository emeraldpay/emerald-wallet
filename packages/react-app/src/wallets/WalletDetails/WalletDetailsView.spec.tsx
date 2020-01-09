import { shallow } from 'enzyme';
import * as React from 'react';
import AccountShow from './WalletDetailsView';
import { WalletOp } from '@emeraldpay/emerald-vault-core';

describe('AccountDetailsView', () => {
  it('Shows HD path for hardware account', () => {
    const wallet = WalletOp.of({
      id: "f692dcb6-74ea-4583-8ad3-fd13bb6c38ee",
      accounts: []
    });
    const wrapper = shallow(<AccountShow showFiat={false} wallet={wallet}/>);
    expect(wrapper).toBeDefined();
  });
});
