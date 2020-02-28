import { mount, shallow } from 'enzyme';
import * as React from 'react';
import DashboardMenu from './DashboardMenu';

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
