import * as React from 'react';
import { shallow } from 'enzyme';

import { TokenBalances, styles } from './TokenBalances';

const reduceClasses = (prev: any, curr: any) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});


describe("TokenBalances", () => {
  it('should renders without crash', () => {
    const balances = [{
      address: '0x1234',
      balance: { value: 1, decimals: 8 },
      symbol: 'DAI',
    }];
    const wrapper = shallow(<TokenBalances classes={classes} balances={balances}/>);
    expect(wrapper).toBeDefined();
  });
});
