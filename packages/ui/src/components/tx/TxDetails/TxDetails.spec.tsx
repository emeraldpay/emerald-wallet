import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { Account } from '@emeraldplatform/ui';
import { TxDetails, styles } from './TxDetails';
import TxInputData from './TxInputData';

const reduceClasses = (prev: any, curr: any) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('TxDetails', () => {
  it('should render nested components correctly', () => {
    const tx = {
      hash: '0x01',
      data: '0xDADA',
      from: '0x1234',
      to: '0x9876'
    };
    const component = mount(<TxDetails classes={classes} transaction={tx} />);
    expect(component).toBeDefined();
  });

  it('should show tx input data', () => {
    const tx = {
      hash: '0x01',
      data: '0xDADA',
    };
    const component = shallow(<TxDetails classes={classes} transaction={tx} />);
    const inputComps = component.find(TxInputData);
    expect(inputComps).toHaveLength(1);
    expect(inputComps.first().props().data).toEqual(tx.data);
  });

  it('should not show To Account if to tx does not have to attribute', () => {
    const tx = {
      hash: '0x01',
      data: '0xDADA',
    };
    const component = shallow(<TxDetails classes={classes} transaction={tx} />);
    expect(component.find(Account)).toHaveLength(1);
  });
});
