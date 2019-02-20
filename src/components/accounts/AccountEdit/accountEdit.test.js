import React from 'react';
import { shallow } from 'enzyme';
import { AccountEdit, styles } from './accountEdit';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('AccountEdit', () => {
  it('renders without crash', () => {
    const component = shallow(<AccountEdit classes={classes}/>);
  });
});
