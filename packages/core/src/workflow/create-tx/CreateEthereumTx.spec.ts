import BigNumber from 'bignumber.js';
import { CreateEthereumTx } from './CreateEthereumTx';
import {ITxDetailsPlain, TxTarget, ValidationResult} from './types';
import {Wei} from '@emeraldpay/bigamount-crypto';

describe('CreateEthereumTx', () => {

  it('creates tx', () => {
    const tx = new CreateEthereumTx();

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
    expect(tx.target).toBe(TxTarget.MANUAL);
    expect(tx.amount).toBe(Wei.ZERO);
  });

  it('fails to validated if set only from', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));

    expect(tx.validate()).toBe(ValidationResult.NO_TO);
  });

  it('fails to validated if set only to', () => {
    const tx = new CreateEthereumTx();
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
  });

  it('validates is set from/to', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';

    expect(tx.validate()).toBe(ValidationResult.OK);
  });

  it('insufficient funds if send whole balance', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.amount = new Wei(1, "ETHER");
    tx.gasPrice = new Wei(10000, "MWEI");

    expect(tx.validate()).toBe(ValidationResult.INSUFFICIENT_FUNDS);
  });

  it('target can be even without to', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));

    expect(tx.validateTarget()).toBeTruthy();
  });

  it('target fails without totalBalance', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));
    tx.target = TxTarget.SEND_ALL;
    tx.totalBalance = undefined;

    expect(tx.validateTarget()).toBeFalsy();
  });

  it('no-target ok without totalBalance', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));
    tx.target = TxTarget.MANUAL;
    tx.totalBalance = undefined;

    expect(tx.validateTarget()).toBeTruthy();
  });

  it('change is 0', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));
    tx.amount = new Wei('999580000000000000', "WEI");
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.gas = new BigNumber(42000);

    const change = tx.getChange() || new Wei(1234);

    expect(change.number).toEqual(new BigNumber(0));
  });

  it('change is positive', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));
    tx.amount = new Wei('959580000000000000', "WEI");
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.gas = new BigNumber(42000);

    const change = tx.getChange() || new Wei(1234);

    expect(change.number).toEqual(new BigNumber(40000000000000000));
  });

  it('change is negative', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));
    tx.amount = new Wei('999580000000000100', "WEI");
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.gas = new BigNumber(42000);

    const change = tx.getChange() || new Wei(1234);

    expect(change.number).toEqual(new BigNumber(-100));
  });

  it('change is unknown without balance', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));
    tx.amount = new Wei('999580000000000100', "WEI");
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.gas = new BigNumber(42000);
    tx.totalBalance = undefined;

    expect(tx.getChange()).toBe(null);
  });

  it('target fails if total is less than whole balance', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.target = TxTarget.SEND_ALL;
    tx.amount = new Wei('999579999999999990', "WEI");
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.gas = new BigNumber(42000);

    expect(tx.getChange()).not.toStrictEqual(Wei.ZERO);
    expect(tx.validateTarget()).toBeFalsy();
  });

  it('no-target succeeds if total is less than whole balance', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.target = TxTarget.MANUAL;
    tx.amount = new Wei('999579999999999990', "WEI");
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.gas = new BigNumber(42000);

    expect(tx.getChange()).not.toStrictEqual(Wei.ZERO);
    expect(tx.validateTarget()).toBeTruthy();
  });

  it('target fails if total is more than whole balance', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.target = TxTarget.SEND_ALL;
    tx.amount = new Wei('999580000000000001', "WEI");
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.gas = new BigNumber(42000);

    const change = tx.getChange();
    console.log('change', change == null ? null : change.toString());
    console.log(tx.debug());

    expect(tx.getChange()).not.toStrictEqual(Wei.ZERO);
    expect(tx.validateTarget()).toBeFalsy();
  });

  it('target succeeds if total is equal whole balance', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.target = TxTarget.SEND_ALL;
    tx.amount = new Wei('999580000000000000', "WEI");
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.gas = new BigNumber(42000);

    const change = tx.getChange();
    console.log('change', change == null ? null : change.toString());
    console.log(tx.debug());

    expect(tx.getChange()).toStrictEqual(Wei.ZERO);
    expect(tx.validate()).toBe(ValidationResult.OK);
    expect(tx.validateTarget()).toBeTruthy();
  });

  it('rebalance to match whole balance', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.target = TxTarget.SEND_ALL;
    tx.amount = new Wei('999580000000500000', "WEI");
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.gas = new BigNumber(42000);

    const change = tx.getChange();
    console.log('change', change == null ? null : change.toString());
    console.log(tx.debug());

    expect(tx.validateTarget()).toBeFalsy();

    const rebalanced = tx.rebalance();

    expect(rebalanced).toBeTruthy();
    expect(tx.validateTarget()).toBeTruthy();
    expect(tx.amount.number.toFixed()).toBe('999580000000000000');
  });

  it('rebalance ignored without totalBalance', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.target = TxTarget.SEND_ALL;
    tx.amount = new Wei('999580000000500000', "WEI");
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.gas = new BigNumber(42000);
    tx.totalBalance = undefined;

    const change = tx.getChange();
    console.log('change', change == null ? null : change.toString());
    console.log(tx.debug());

    expect(tx.validateTarget()).toBeFalsy();

    const rebalanced = tx.rebalance();

    expect(rebalanced).toBeFalsy();
    expect(tx.validateTarget()).toBeFalsy();
    expect(tx.amount.number.toFixed()).toBe('999580000000500000');
  });

  it('rebalance does nothing for no-target', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1, "ETHER"));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.target = TxTarget.MANUAL;
    tx.amount = new Wei('999580000000500000', "WEI");
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.gas = new BigNumber(42000);

    expect(tx.validateTarget()).toBeTruthy();

    const rebalanced = tx.rebalance();

    expect(rebalanced).toBeTruthy();
    expect(tx.validateTarget()).toBeTruthy();
    expect(tx.amount.number.toFixed()).toBe('999580000000500000');
  });

  it('doesnt rebalance small value', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei('1000000000000', "WEI"));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.target = TxTarget.SEND_ALL;
    tx.amount = new Wei('999580000000500000', "WEI");
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.gas = new BigNumber(42000);

    expect(tx.validateTarget()).toBeFalsy();

    const rebalanced = tx.rebalance();

    expect(rebalanced).toBeFalsy();
    expect(tx.validateTarget()).toBeFalsy();
    expect(tx.amount.number.toFixed()).toBe('999580000000500000');
  });

  it('dumps plain', () => {
    const tx = new CreateEthereumTx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei('1000000000057', "WEI"));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.target = TxTarget.SEND_ALL;
    tx.amount = new Wei('999580000000500002', "WEI");
    tx.gasPrice = new Wei(10007, "MWEI");
    tx.gas = new BigNumber(42011);

    const dump = tx.dump();

    expect(dump.from).toBe('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(dump.totalTokenBalance).toBe('1000000000057/WEI');
    expect(dump.to).toBe('0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd');
    expect(dump.target).toBe(1);
    expect(dump.amount).toBe('999580000000500002/WEI');
    expect(dump.amountDecimals).toBe(18);
    expect(dump.gasPrice).toBe('10007000000/WEI');
    expect(dump.gas).toBe(42011);
  });

  it('reads from dumps', () => {
    const dump: ITxDetailsPlain = {
      tokenSymbol: 'ETH',
      from: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      totalTokenBalance: '1000000000057/WEI',
      amountDecimals: 18,
      to: '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd',
      target: 1,
      amount: '999580000000500002/WEI',
      gasPrice: '10007000000/WEI',
      gas: 42011
    };

    const tx = CreateEthereumTx.fromPlain(dump);

    expect(tx.from).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.totalBalance != null ? tx.totalBalance : null).toEqual(new Wei('1000000000057', "WEI"));
    expect(tx.to).toEqual('0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd');
    expect(tx.target).toEqual(TxTarget.SEND_ALL);
    expect(tx.amount).toEqual(new Wei('999580000000500002', "WEI"));
    expect(tx.gasPrice).toEqual(new Wei(10007, "MWEI"));
    expect(tx.gas).toEqual(new BigNumber(42011));
  });

  it('reads from dumps, manual tx', () => {
    const dump: ITxDetailsPlain = {
      from: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      totalTokenBalance: '1000000000057/WEI',
      amountDecimals: 18,
      to: '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd',
      target: 0,
      amount: '999580000000500002/WEI',
      gasPrice: '10007000000/WEI',
      gas: 42011,
      tokenSymbol: 'ETH'
    };

    const tx = CreateEthereumTx.fromPlain(dump);

    expect(tx.from).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.totalBalance != null ? tx.totalBalance : null).toEqual(new Wei('1000000000057', "WEI"));
    expect(tx.to).toEqual('0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd');
    expect(tx.target).toEqual(TxTarget.MANUAL);
    expect(tx.amount).toEqual(new Wei('999580000000500002', "WEI"));
    expect(tx.gasPrice).toEqual(new Wei(10007, "MWEI"));
    expect(tx.gas).toEqual(new BigNumber(42011));
  });

});
