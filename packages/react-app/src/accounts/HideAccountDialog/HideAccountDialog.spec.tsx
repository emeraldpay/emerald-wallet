import * as React from 'react';
import { shallow } from 'enzyme';
import { HideAccountDialog, styles } from './HideAccountDialog';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('HideAccountDialog', () => {
  it('renders without crash', () => {
    const component = shallow(<HideAccountDialog classes={classes} />);
    expect(component).toBeDefined();
  });
});
