import { shallow } from 'enzyme';
import * as React from 'react';

import { styles, TokenBalances } from './TokenBalances';

const reduceClasses = (prev: any, curr: any) => ({ ...prev, [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('TokenBalances', () => {
  it('should renders without crash', () => {
    const balances = [{
      tokenId: '0xE',
      address: '0x1234',
      unitsValue: '1',
      decimals: 8,
      symbol: 'DAI'
    }];
    const wrapper = shallow(<TokenBalances classes={classes} balances={balances}/>);
    expect(wrapper).toBeDefined();
  });
});
