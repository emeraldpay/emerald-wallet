import { render } from '@testing-library/react';
import * as React from 'react';
import TotalButton from './TotalButton';
import {CurrencyAmount} from "@emeraldwallet/core";

describe('Total', () => {
  it('should renders without crash', () => {
    const component = render(<TotalButton byChain={[]} total={new CurrencyAmount(0, "USD")}/>);
    expect(component).toBeDefined();
  });
});
