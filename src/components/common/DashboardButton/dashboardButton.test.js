import React from 'react';
import { shallow } from 'enzyme';

import DashboardButton from './dashboardButton';

test('Shows button with custom label', () => {
    const component = shallow(<DashboardButton label="PRIV1" />);
    expect(component.findWhere((n) => n.text() === 'PRIV1')).toHaveLength(2);
});
