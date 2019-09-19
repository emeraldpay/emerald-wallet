import { shallow } from 'enzyme';
import * as React from 'react';
import { HideAccountDialog, styles } from './HideAccountDialog';

const reduceClasses = (prev: any, curr: any) => ({ ...prev, [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('HideAccountDialog', () => {
  it('renders without crash', () => {
    const component = shallow(<HideAccountDialog classes={classes} />);
    expect(component).toBeDefined();
  });
});
