import React from 'react';
import { shallow } from 'enzyme';
import { ArrowLeft as ArrowLeftIcon } from 'emerald-js-ui/lib/icons';
import DashboardButton from './dashboardButton';

describe('DashboardButton', () => {
  it('shows button with custom label', () => {
    const component = shallow(<DashboardButton label="PRIV1" />);
    expect(component.findWhere((n) => n.text() === 'PRIV1')).toHaveLength(2);
  });

  it('renders ArrowLeft icon', () => {
    const wrapper = shallow(<DashboardButton />);
    expect(wrapper.find(ArrowLeftIcon).length).toBe(1);
  });
});
