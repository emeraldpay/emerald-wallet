import * as React from 'react';
import { shallow } from 'enzyme';
import { ImportMnemonic, styles } from './ImportMnemonic';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('ImportMnemonic', () => {
  it('renders without crash', () => {
    const component = shallow(<ImportMnemonic classes={classes} />);
    expect(component).toBeDefined();
  });
});
