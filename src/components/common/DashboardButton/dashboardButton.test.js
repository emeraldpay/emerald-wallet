import React from 'react';
import { shallow } from 'enzyme';
import { Back } from 'emerald-js-ui/lib/icons3';
import DashboardButton from './dashboardButton';

describe('DashboardButton', () => {
  it('shows button with custom label', () => {
    const component = shallow(<DashboardButton label="PRIV1" />);
    expect(component.findWhere((n) => n.text() === 'PRIV1')).toHaveLength(2);
  });

  it('renders default label', () => {
    const wrapper = shallow(<DashboardButton />);
    expect(wrapper.find(Back).length).toBe(1);
    expect(wrapper.findWhere((n) => n.text() === 'Dashboard')).toHaveLength(2);
  });
});
