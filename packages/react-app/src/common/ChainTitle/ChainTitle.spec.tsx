import { BlockchainCode } from '@emeraldwallet/core';
import { render } from '@testing-library/react';
import * as React from 'react';
import ChainTitle from './ChainTitle';

describe('ChainTitle', () => {
  it('should renders without crash', () => {
    const wrapper = render(<ChainTitle blockchain={BlockchainCode.ETH} title="Title" />);

    expect(wrapper).toBeDefined();
  });
});
