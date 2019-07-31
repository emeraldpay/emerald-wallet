import * as React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { ShowContact, styles } from './ShowContact';

const reduceClasses = (prev: any, curr: any) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

const account = fromJS({});
describe('ShowContact', () => {
  it('should renders without crash', () => {
    const wrapper = shallow(<ShowContact classes={classes} address={account}  />);
    expect(wrapper).toBeDefined();
  });
});
