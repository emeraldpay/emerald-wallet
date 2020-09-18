import { mount, shallow } from 'enzyme';
import * as React from 'react';
import Balance from './Balance';
import {Wei} from "@emeraldpay/bigamount-crypto";

describe('Balance', () => {
  it('renders without crash', () => {
    const component = shallow(
      <Balance
        balance={new Wei(1.56)}
      />
      );
    expect(component).toBeDefined();
  });
});
