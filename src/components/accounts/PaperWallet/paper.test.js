import React from 'react';
import { shallow } from 'enzyme';

import { PaperWalletPrint } from './paper';

test('Shows private key', () => {
    const component = shallow(<PaperWalletPrint privKey="0xPRIV1" address="0xADDR1"/>);
    expect(component.findWhere((n) => n.text() === '0xPRIV1')).toHaveLength(2);
});
