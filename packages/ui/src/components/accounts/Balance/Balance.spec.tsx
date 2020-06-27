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
});
