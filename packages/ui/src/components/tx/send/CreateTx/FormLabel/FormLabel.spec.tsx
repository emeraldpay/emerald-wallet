import { shallow } from 'enzyme';
import * as React from 'react';
import { Label } from './FormLabel';

const reduceClasses = (prev: any, curr: any) => ({ ...prev, [curr]: curr });
const classes = Object.keys({}).reduce(reduceClasses, {});

describe('FormLabel', () => {
  it('should render', () => {
    const wrapper = shallow(<Label classes={classes}/>);
    expect(wrapper).toBeDefined();
  });
});
