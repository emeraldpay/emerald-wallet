import { mount, shallow } from 'enzyme';
import * as React from 'react';
import Balance from './Balance';

describe('Balance', () => {
  it('renders without crash', () => {
    const component = shallow(
      <Balance
        symbol=''
        balance='1'
        decimals={2}
      />
      );
    expect(component).toBeDefined();
  });

  it('does not show fiat by default', () => {
    const component = mount(
      <Balance
        symbol=''
        balance='1'
        decimals={2}
      />
      );
    expect(component.props().showFiat).toBeDefined();
    expect(component.props().showFiat).toBeFalsy();
  });
});
