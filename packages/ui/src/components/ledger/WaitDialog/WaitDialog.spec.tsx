import * as React from 'react';
import { shallow } from 'enzyme';
import { WaitConnectionDialog, styles2 } from './WaitDialog';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});

describe('WaitDialog', () => {
  it('should not crash', () => {
    const component = shallow(<WaitConnectionDialog classes={classes} />);
    expect(component).toBeDefined();
  })
});
