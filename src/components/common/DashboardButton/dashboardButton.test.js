import React from 'react';
import { shallow } from 'enzyme';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import DashboardButton from './dashboardButton';

describe('DashboardButton', () => {
  it('shows button with custom label', () => {
    const component = shallow(<DashboardButton label="PRIV1" />);
    expect(component.findWhere((n) => n.text() === 'PRIV1')).toHaveLength(2);
  });

  it('renders KeyboardArrowLeft icon', () => {
    const wrapper = shallow(<DashboardButton />);
    expect(wrapper.find(KeyboardArrowLeft).length).toBe(1);
  });
});
