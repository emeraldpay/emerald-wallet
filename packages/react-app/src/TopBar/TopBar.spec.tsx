import { shallow } from 'enzyme';
import * as React from 'react';
import { TopBar, styles } from './TopBar';

const reduceClasses = (prev: any, curr: any) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('TopBar', () => {
  it('creates without crash', () => {
    const wrapper = shallow(<TopBar classes={classes} />);
  });
});
