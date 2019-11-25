import { render } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import Total from './Total';

describe('Total', () => {
  it('should renders without crash', () => {
    const component = render(<Total byChain={[]} total={new BigNumber(0)} />);
    expect(component).toBeDefined();
  });
});
