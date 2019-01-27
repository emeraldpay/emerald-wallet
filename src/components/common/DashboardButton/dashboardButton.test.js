import React from 'react';
import { shallow } from 'enzyme';
import { Back } from 'emerald-js-ui/lib/icons3';
import { DashboardButton, styles } from './dashboardButton';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('DashboardButton', () => {
  it('shows button with custom label', () => {
    const component = shallow(<DashboardButton classes={classes} label="PRIV1" />);
    expect(component.findWhere((n) => n.text() === 'PRIV1')).toHaveLength(2);
  });

  it('renders default label', () => {
    const wrapper = shallow(<DashboardButton classes={classes} />);
    expect(wrapper.find(Back).length).toBe(1);
    expect(wrapper.findWhere((n) => n.text() === 'Dashboard')).toHaveLength(2);
  });
});
