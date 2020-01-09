import { render } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import Total from './Total';
import {Units} from "@emeraldwallet/core";

describe('Total', () => {
  it('should renders without crash', () => {
    const component = render(<Total byChain={[]} total={new Units(0, 2)} />);
    expect(component).toBeDefined();
  });
});
