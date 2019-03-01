import React from 'react';
import { shallow } from 'enzyme';
import { TxStatus, styles } from './TxStatus';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('TxStatus', () => {
  it('should render without crash', () => {
    const wrapper = shallow(<TxStatus classes={classes}/>);
    expect(wrapper).toBeDefined();
  });
});
