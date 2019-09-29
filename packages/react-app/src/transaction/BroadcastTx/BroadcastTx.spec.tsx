import { BlockchainCode } from '@emeraldwallet/core';
// tslint:disable-next-line:no-submodule-imports
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import * as React from 'react';
import { BroadcastTxView, styles } from './BroadcastTx';

const reduceClasses = (prev: any, curr: any) => ({ ...prev, [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('BroadcastTxView', () => {
  const signedRawTx = '0xf8aa808502540be400830186a094aff4481d10270f50f203e0763e2597776068cbc580b844a9059cbb000000000000000000000000aff4481d10270f50f203e0763e2597776068cbc5000000000000000000000000000000000000000000000000000000000000000077a03de05abc2e11ecf3ec3b1e1eeb3257ce51cad9cee10336b3b54e146469a2369fa047c6296bfc2551278ad808969a07b483506dda8896741191d74e7deabc2dbd02';

  it('should work without crash', () => {
    const wrapper = render(<BroadcastTxView classes={classes} signed={signedRawTx} tx={{ blockchain: BlockchainCode.Kovan }}/>);
    expect(wrapper).toBeDefined();
  });

  it('should display tx value for ordinary tx', async () => {
    const rawTx = '0xf86943843b9aca0082520894b780b602f934e95e3598463d3cd26d2a1ad4c8e9865af3107a4000801ca0f557cb12da8ace97df5a90f458144be7fdb32b9510af47d764fb13ab72f3e810a051717e3ba63d713393b66a72649058b9d19e36676609697c07243415bcd04b4a';
    const wrapper = render(<BroadcastTxView classes={classes} signed={rawTx} tx={{ blockchain: BlockchainCode.Kovan }}/>);
    const valueDiv = await wrapper.findByTestId('token-amount');
    expect(valueDiv).toBeDefined();
    expect(valueDiv).toHaveTextContent('0.0001 KOVAN');
    const nonceDiv = await wrapper.findByTestId('nonce');
    expect(nonceDiv).toHaveTextContent('67');
  });
});
