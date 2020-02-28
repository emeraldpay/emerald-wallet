import { BlockchainCode } from '@emeraldwallet/core';
import { shallow } from 'enzyme';
import * as React from 'react';
import StyledChainSelector, { ChainSelector, styles } from './ChainSelector';

const reduceClasses = (prev, curr) => ({ ...prev, [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('ChainSelector', () => {
  it('creates ChainSelector', () => {
    const component = shallow(<ChainSelector classes={classes} value={BlockchainCode.ETH} chains={[]}/>);
    expect(component).toBeDefined();
  });

  it('should work without theme', () => {
    const component = shallow(<StyledChainSelector value={BlockchainCode.ETH} chains={[]}/>);
    expect(component).toBeDefined();
  });
});
