import React from 'react';
import { shallow } from 'enzyme';

import { PaperWallet, styles2 } from './paper';


const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});

test('Shows private key', () => {
  const component = shallow(<PaperWallet classes={classes} privKey="0xPRIV1" address="0xADDR1"/>);
  expect(component.findWhere((n) => n.text() === '0xPRIV1')).toHaveLength(2);
});
