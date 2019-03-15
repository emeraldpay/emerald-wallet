import * as React from 'react';
import { shallow } from 'enzyme';
import { TxStatus, styles } from './TxStatus';

const reduceClasses = (prev: any, curr: any) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('TxStatus', () => {
  it('should render without crash', () => {
    const wrapper = shallow(<TxStatus status="" classes={classes}/>);
    expect(wrapper).toBeDefined();
  });
});
