import * as React from 'react';
import BigNumber from 'bignumber.js';
import { mount } from 'enzyme';
import { TxItem, styles2 } from './TxItem';

const reduceClasses = (prev: any, curr: any) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});

const theme = {
  palette: {},
};

const tx = {
  blockNumber: 1,
  from: '0x1',
  to: '0x2',
  value: new BigNumber(100000)
};
const from = {};
const to = {};

describe('TxItem', () => {
  it('should renders without crash', () => {
    const wrapper = mount(
      <TxItem
        openAccount={() => {}}
        openTx={() => {}}
        netParams={
          {
            currentBlockHeight: 100,
            requiredConfirmations: 12,
          }
        }
        classes={classes}
        tx={tx}
        fromAccount={from}
        toAccount={to}
      />);
    expect(wrapper).toBeDefined();
  });
});
