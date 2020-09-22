import BigNumber from 'bignumber.js';
import { CreateEthereumTx, TxTarget, ValidationResult } from '..';
import {DisplayEtherTx} from './DisplayEtherTx';
import {Wei} from '@emeraldpay/bigamount-crypto';

describe('DisplayEtherTx', () => {
  it('standard tx', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei('1000000000057', "WEI"));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.target = TxTarget.MANUAL;
    tx.amount = new Wei('5999580000000000000', "WEI");
    tx.gasPrice = new Wei(10007, "MWEI");
    tx.gas = new BigNumber(21000);

    const display = new DisplayEtherTx(tx);

    expect(tx.amount.number.toFixed()).toBe('5999580000000000000');

    expect(display.amount()).toBe('5.99958');
    expect(display.amountUnit()).toBe('Ether');
    expect(display.fee()).toBe('21000');
    expect(display.feeUnit()).toBe('Gas');
    expect(display.feeCost()).toBe('0.00021');
    expect(display.feeCostUnit()).toBe('Ether');
  });

  // Check this test again in the future
  // it('tx without amount', () => {
  //   const tx = new CreateEthereumTx();
  //   tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei('1000000000057', Units.WEI));
  //   tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
  //   tx.target = TxTarget.MANUAL;
  //   tx.amount = undefined;
  //   tx.gasPrice = new Wei(10007, Units.MWEI);
  //   tx.gas = new BigNumber(21000);
  //
  //   const display = new DisplayEtherTx(tx);
  //
  //   expect(display.amount()).toBe('-');
  //   expect(display.amountUnit()).toBe('Ether');
  //   expect(display.fee()).toBe('21000');
  //   expect(display.feeUnit()).toBe('Gas');
  //   expect(display.feeCost()).toBe('0.00021');
  //   expect(display.feeCostUnit()).toBe('Ether');
  // });

  it('tx with zero amount', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei('1000000000057', "WEI"));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.target = TxTarget.MANUAL;
    tx.amount = new Wei('0', "WEI");
    tx.gasPrice = new Wei(10007, "MWEI");
    tx.gas = new BigNumber(21000);

    const display = new DisplayEtherTx(tx);

    expect(display.amount()).toBe('0');
    expect(display.amountUnit()).toBe('Ether');
    expect(display.fee()).toBe('21000');
    expect(display.feeUnit()).toBe('Gas');
    expect(display.feeCost()).toBe('0.00021');
    expect(display.feeCostUnit()).toBe('Ether');
  });
});
