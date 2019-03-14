import * as React from 'react';
import { shallow } from 'enzyme';
import { PaperWallet, styles } from './PaperWallet';

const reduceClasses = (prev: any, curr: any) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('PaperWallet', () => {
  it('shows private key', () => {
    const component = shallow(<PaperWallet classes={classes} privKey="0xPRIV1" address="0xADDR1"/>);
    expect(component.findWhere((n) => n.text() === '0xPRIV1')).toHaveLength(2);
  });
});

