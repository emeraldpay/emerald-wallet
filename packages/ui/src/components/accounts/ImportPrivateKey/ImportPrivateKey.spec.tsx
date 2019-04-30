import * as React from 'react';
import { shallow } from 'enzyme';
import { ImportPrivateKey, styles } from './ImportPrivateKey';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});


describe('ImportPrivateKey', () => {
  it('renders without crash', () => {
    const component = shallow(<ImportPrivateKey classes={classes} />);
    expect(component).toBeDefined();
  });
});
