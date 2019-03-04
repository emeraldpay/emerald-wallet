import React from 'react';
import { shallow, mount } from 'enzyme';
import { Balance } from './balance';

describe('Balance', () => {
  it('renders without crash', () => {
    const component = shallow(<Balance />);
  });

  it('does not show fiat by default', () => {
    const component = mount(<Balance />);
    expect(component.props().showFiat).toBeDefined();
    expect(component.props().showFiat).toBeFalsy();
  });
});
