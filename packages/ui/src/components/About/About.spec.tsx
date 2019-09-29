import { shallow } from 'enzyme';
import * as React from 'react';
import { About } from './About';

const reduceClasses = (prev: any, curr: any) => ({ ...prev,  [curr]: curr });
const classes = Object.keys({ appName: {}, componentsVer: {}, links: {} }).reduce(reduceClasses, {});

describe('About', () => {
  it('renders about page without crash', () => {
    const component = shallow(<About classes={classes}/>);
    expect(component).toBeDefined();
  });
});
