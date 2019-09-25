import { shallow } from 'enzyme';
import * as React from 'react';

import { BlockchainCode } from '@emeraldwallet/core';
import { BroadcastTxView, styles } from './BroadcastTx';

const reduceClasses = (prev: any, curr: any) => ({ ...prev, [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('BroadcastTxView', () => {
  it('should work without crash', () => {
    const signed = '0xf8aa808502540be400830186a094aff4481d10270f50f203e0763e2597776068cbc580b844a9059cbb000000000000000000000000aff4481d10270f50f203e0763e2597776068cbc5000000000000000000000000000000000000000000000000000000000000000077a03de05abc2e11ecf3ec3b1e1eeb3257ce51cad9cee10336b3b54e146469a2369fa047c6296bfc2551278ad808969a07b483506dda8896741191d74e7deabc2dbd02';
    const wrapper = shallow(<BroadcastTxView classes={classes} signed={signed} tx={{ blockchain: BlockchainCode.Kovan }}/>);
    expect(wrapper).toBeDefined();
  });
});
