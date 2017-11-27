import React from 'react';
import { shallow } from 'enzyme';

import { PaperWallet } from './paper';

test('Shows private key', () => {
  const component = shallow(<PaperWallet privKey="0xPRIV1" address="0xADDR1"/>);
  expect(component.findWhere((n) => n.text() === '0xPRIV1')).toHaveLength(2);
});
