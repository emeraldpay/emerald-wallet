import React from 'react';
import { shallow } from 'enzyme';

import AccountAddress from './accountAddress';

test('AccountAddress shows address', () => {
    const accountAddr = shallow(
        <AccountAddress id="0x123" />
    );
    expect(accountAddr.find('div').children().find('div').text()).toEqual('0x123');
});
