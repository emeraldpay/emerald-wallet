import { render } from '@testing-library/react';
import * as React from 'react';
import TokenBalances from './TokenBalances';

describe('TokenBalance', () => {
  it('should renders without crash', () => {
    const balances = [{
      tokenId: '0xE',
      address: '0x1234',
      unitsValue: '1',
      decimals: 8,
      symbol: 'DAI'
    }];
    const component = render(<TokenBalances balances={balances}/>);
    expect(component).toBeDefined();
  });
});
