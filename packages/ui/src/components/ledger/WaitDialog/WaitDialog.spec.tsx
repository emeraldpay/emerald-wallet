import { shallow } from 'enzyme';
import * as React from 'react';
import { styles2, WaitConnectionDialog } from './WaitDialog';

const reduceClasses = (prev, curr) => ({ ...prev, [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});

describe('WaitDialog', () => {
  it('should not crash', () => {
    const component = shallow(<WaitConnectionDialog classes={classes} />);
    expect(component).toBeDefined();
  });
});
