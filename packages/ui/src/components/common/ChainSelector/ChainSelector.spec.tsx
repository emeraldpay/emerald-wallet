import { Theme } from '@emeraldwallet/ui';
import { BlockchainCode } from '@emeraldwallet/core';
import { ThemeProvider } from '@mui/material';
import { shallow } from 'enzyme';
import * as React from 'react';
import StyledChainSelector, { ChainSelector } from './ChainSelector';

describe('ChainSelector', () => {
  it('creates ChainSelector', () => {
    const component = shallow(
      <ThemeProvider theme={Theme}>
        <ChainSelector initialValue={BlockchainCode.ETH} blockchains={[]} />
      </ThemeProvider>,
    );

    expect(component).toBeDefined();
  });

  it('should work without theme', () => {
    const component = shallow(
      <ThemeProvider theme={Theme}>
        <StyledChainSelector initialValue={BlockchainCode.ETH} blockchains={[]} />
      </ThemeProvider>,
    );

    expect(component).toBeDefined();
  });
});
