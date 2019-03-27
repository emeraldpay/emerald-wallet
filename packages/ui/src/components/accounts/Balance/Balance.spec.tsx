import * as React from 'react';
import { shallow, mount } from 'enzyme';
import Balance from './Balance';

describe('Balance', () => {
  it('renders without crash', () => {
    const component = shallow(
      <Balance
        symbol=""
        balance="1"
        decimals={2}
      />);
  });

  it('does not show fiat by default', () => {
    const component = mount(
      <Balance
        symbol=""
        balance="1"
        decimals={2}
      />);
    expect(component.props().showFiat).toBeDefined();
    expect(component.props().showFiat).toBeFalsy();
  });
});
