import { Theme } from '@emeraldwallet/ui';
import { BlockchainCode } from '@emeraldwallet/core';
import { ThemeProvider } from '@material-ui/core';
import { shallow } from 'enzyme';
import * as React from 'react';
import StyledChainSelector, { ChainSelector, styles } from './ChainSelector';

const reduceClasses = <T,>(prev: T, curr: any): T => ({ ...prev, [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('ChainSelector', () => {
  it('creates ChainSelector', () => {
    const component = shallow(
      <ThemeProvider theme={Theme}>
        <ChainSelector classes={classes} value={BlockchainCode.ETH} chains={[]} />
      </ThemeProvider>,
    );
    expect(component).toBeDefined();
  });

  it('should work without theme', () => {
    const component = shallow(
      <ThemeProvider theme={Theme}>
        <StyledChainSelector value={BlockchainCode.ETH} chains={[]} />
      </ThemeProvider>,
    );
    expect(component).toBeDefined();
  });
});
