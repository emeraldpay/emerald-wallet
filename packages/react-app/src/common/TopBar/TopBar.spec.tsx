import { shallow } from 'enzyme';
import * as React from 'react';
import { styles, TopBar } from './TopBar';

const reduceClasses = (prev: any, curr: any) => ({...prev,  [curr]: curr});
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('TopBar', () => {
  it('creates without crash', () => {
    const wrapper = shallow(<TopBar classes={classes} />);
  });
});
