import * as React from 'react';
import { shallow } from 'enzyme';
import { ChainSelector, styles } from './ChainSelector';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('ChainSelector', () => {
  it('creates ChainSelector', () => {
    const component = shallow(<ChainSelector classes={classes} value="ETH" />);
    expect(component).toBeDefined();
  });
});
