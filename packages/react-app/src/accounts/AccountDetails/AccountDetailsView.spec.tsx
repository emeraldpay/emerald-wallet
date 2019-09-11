import * as React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AccountShow from './AccountDetailsView';

describe("AccountDetailsView", () => {
  it('Shows HD path for hardware account', () => {
    const account = fromJS({
      id: '0x1234',
      hardware: true,
      hdpath: 'HD/PATH',
      blockchain: 'etc',
    });
    const wrapper = shallow(<AccountShow showFiat={false} account={account}/>);
    expect(wrapper).toBeDefined();
  });
});



