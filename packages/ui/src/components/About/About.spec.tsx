import * as React from 'react';
import { shallow } from 'enzyme';
import { About } from './About';

const reduceClasses = (prev: any, curr: any) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys({ appName: {}, componentsVer: {}, links: {} }).reduce(reduceClasses, {});

describe('About', () => {
  it('renders about page without crash', () => {
    const component = shallow(<About classes={classes}/>);
    expect(component).toBeDefined();
  });
});
