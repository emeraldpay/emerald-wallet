import React from 'react';
import { shallow } from 'enzyme';
import { ImportMnemonic, styles2 } from './importMnemonic';


const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});

describe('ImportMnemonic', () => {
  it('renders without crash', () => {
    const component = shallow(<ImportMnemonic classes={classes} />);
  });
});
