import { render } from '@testing-library/react';
import * as React from 'react';
import TotalButton from './TotalButton';
import {Units} from "@emeraldwallet/core";

describe('Total', () => {
  it('should renders without crash', () => {
    const component = render(<TotalButton byChain={[]} total={new Units(0, 2)} />);
    expect(component).toBeDefined();
  });
});
