import * as React from 'react';
import { shallow, mount } from 'enzyme';
import DashboardMenu from './DashboardMenu';

// const reduceClasses = (prev: any, curr: any) => Object.assign({}, prev, { [curr]: curr });
// const classes = Object.keys({}).reduce(reduceClasses, {});


describe('DashboardMenu', () => {
  it('renders without crashing', () => {
    const component = shallow(<DashboardMenu />);
    expect(component).toBeDefined();
  });
  it('renders without crashing', () => {
    const component = mount(<DashboardMenu />);
    expect(component).toBeDefined();
  });
});
