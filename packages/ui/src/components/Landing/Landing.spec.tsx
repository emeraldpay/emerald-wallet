import { shallow } from 'enzyme';
import * as React from 'react';
import { Landing } from './Landing';

const reduceClasses = (prev: any, curr: any) => ({...prev,  [curr]: curr});
const classes = Object.keys({}).reduce(reduceClasses, {});

describe('Landing', () => {
  it('renders without crashing', () => {
    const component = shallow(<Landing classes={classes}/>);
    expect(component).toBeDefined();
  });
});
