import { Units as EthUnits, Wei } from '@emeraldplatform/eth';
import BigNumber from 'bignumber.js';
import { Units } from '../../Units';
import { CreateERC20Tx, TransferType } from './CreateErc20Tx';
import { ITxDetailsPlain, TxTarget, ValidationResult } from './types';

describe('CreateErc20Tx', () => {
  it('creates tx', () => {
    const tx = new CreateERC20Tx();

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
    expect(tx.target).toBe(TxTarget.MANUAL);
    expect(tx.transferType).toBe(TransferType.STANDARD);
    expect(tx.amount.amount.toString()).toBe('0');
  });

  it('invalid without from', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));
    tx.from = undefined;

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
  });
  it('invalid without balance', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));
    tx.totalEtherBalance = undefined;

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
  });
  it('invalid without token balance', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));
    tx.totalTokenBalance = undefined;

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
  });

  it('invalid without to', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));

    expect(tx.validate()).toBe(ValidationResult.NO_TO);
  });

  it('invalid without enough tokens', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.amount = new Units(101, 8);

    expect(tx.validate()).toBe(ValidationResult.INSUFFICIENT_TOKEN_FUNDS);
  });

  it('invalid without enough ether', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.WEI));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, EthUnits.MWEI);
    tx.amount = new Units(100, 8);

    expect(tx.validate()).toBe(ValidationResult.INSUFFICIENT_FUNDS);
  });

  it('valid', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, EthUnits.MWEI);
    tx.amount = new Units(100, 8);

    expect(tx.validate()).toBe(ValidationResult.OK);
  });

  it('zero change', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, EthUnits.MWEI);
    tx.amount = new Units(100, 8);

    expect(tx.getChange()).toBeDefined();
    expect(tx.getChange() || '?').toEqual(new Units(0, 8));
  });

  it('has change', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, EthUnits.MWEI);
    tx.amount = new Units(50, 8);

    expect(tx.getChange()).toBeDefined();
    expect(tx.getChange() || '?').toEqual(new Units(50, 8));
  });

  it('change is null if total not set', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));
    tx.totalTokenBalance = undefined;
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, EthUnits.MWEI);
    tx.amount = new Units(50, 8);

    expect(tx.getChange()).toBeNull();
  });

  it('fees', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, EthUnits.MWEI);
    tx.gas = new BigNumber(150000);
    tx.amount = new Units(100, 8);

    expect(tx.getFees()).toBeDefined();
    expect((tx.getFees() || '?').toString(EthUnits.ETHER, 6)).toEqual('0.0015');
  });

  it('fees are calculated if total not set', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));
    tx.totalEtherBalance = undefined;
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, EthUnits.MWEI);
    tx.gas = new BigNumber(150000);
    tx.amount = new Units(100, 8);

    expect(tx.getFees()).toBeDefined();
    expect((tx.getFees() || '?').toString(EthUnits.ETHER, 6)).toEqual('0.0015');
  });

  it('fees change', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, EthUnits.MWEI);
    tx.gas = new BigNumber(150000);
    tx.amount = new Units(100, 8);

    expect(tx.getFeesChange()).toBeDefined();
    expect((tx.getFeesChange() || '?').toString(EthUnits.ETHER, 6)).toEqual('0.9985');
  });

  it('fees change are null if total not set', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));
    tx.totalEtherBalance = undefined;
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, EthUnits.MWEI);
    tx.gas = new BigNumber(150000);
    tx.amount = new Units(100, 8);

    expect(tx.getFeesChange()).toBeNull();
  });

  it('rebalance to max sets max', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.amount = new Units(20, 8);
    tx.target = TxTarget.SEND_ALL;

    expect(tx.getTotal()).toEqual(new Units(20, 8));
    expect(tx.rebalance()).toBeTruthy();
    expect(tx.getTotal()).toEqual(new Units(100, 8));
  });

  it('rebalance to manual doenst change amount', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.amount = new Units(20, 8);
    tx.target = TxTarget.MANUAL;

    console.log(tx.debug());

    expect(tx.getTotal()).toEqual(new Units(20, 8));
    expect(tx.rebalance()).toBeTruthy();
    expect(tx.getTotal()).toEqual(new Units(20, 8));
  });

  it('doesnt rebalance if total not set', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));
    tx.totalTokenBalance = undefined;
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.amount = new Units(20, 8);
    tx.target = TxTarget.SEND_ALL;

    expect(tx.getTotal()).toEqual(new Units(20, 8));
    expect(tx.rebalance()).toBeFalsy();
    expect(tx.getTotal()).toEqual(new Units(20, 8));
  });

  it('dumps plain', () => {
    const tx = new CreateERC20Tx();
    tx.erc20 = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Units(100, 8), new Wei(1, EthUnits.ETHER));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.amount = new Units(20, 8);
    tx.gasPrice = new Wei(10007, EthUnits.MWEI);
    tx.gas = new BigNumber(42011);
    tx.target = TxTarget.SEND_ALL;

    const dump = tx.dump();

    expect(dump.from).toBe('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(dump.erc20).toBe('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(dump.totalEtherBalance).toBe('1000000000000000000');
    expect(dump.totalTokenBalance).toBe('100');
    expect(dump.to).toBe('0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd');
    expect(dump.target).toBe(1);
    expect(dump.amount).toBe('20');
    expect(dump.gasPrice).toBe('10007000000');
    expect(dump.gas).toBe(42011);
    expect(dump.transferType).toBe(0);
  });

  it('reads from dumps', () => {
    const dump: ITxDetailsPlain = {
      from: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      erc20: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      totalEtherBalance: '1000000000057',
      totalTokenBalance: '2000000000015',
      amountDecimals: 8,
      to: '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd',
      target: 1,
      amount: '999580000000500002',
      gasPrice: '10007000000',
      gas: 42011,
      transferType: 0,
      tokenSymbol: 'BTC'
    };

    const tx = CreateERC20Tx.fromPlain(dump);

    expect(tx.from).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.totalEtherBalance != null ? tx.totalEtherBalance.value : null).toEqual(new Wei('1000000000057', EthUnits.WEI).value);
    expect(tx.totalTokenBalance).toEqual(new Units('2000000000015', 8));
    expect(tx.erc20).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.to).toEqual('0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd');
    expect(tx.target).toEqual(TxTarget.SEND_ALL);
    expect(tx.amount).toEqual(new Units('999580000000500002', 8));
    expect(tx.gasPrice.value).toEqual(new Wei(10007, EthUnits.MWEI).value);
    expect(tx.gas).toEqual(new BigNumber(42011));
    expect(tx.transferType).toEqual(TransferType.STANDARD);
  });

  it('reads from dumps - delegate mode', () => {
    const dump: ITxDetailsPlain = {
      from: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      erc20: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      totalEtherBalance: '1000000000057',
      totalTokenBalance: '2000000000015',
      amountDecimals: 8,
      to: '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd',
      target: 1,
      amount: '999580000000500002',
      gasPrice: '10007000000',
      gas: 42011,
      transferType: 1,
      tokenSymbol: 'BTC'
    };

    const tx = CreateERC20Tx.fromPlain(dump);

    expect(tx.from).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.totalEtherBalance != null ? tx.totalEtherBalance.value : null).toEqual(new Wei('1000000000057', EthUnits.WEI).value);
    expect(tx.totalTokenBalance != null ? tx.totalTokenBalance : null).toEqual(new Units('2000000000015', 8));
    expect(tx.erc20).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.to).toEqual('0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd');
    expect(tx.target).toEqual(TxTarget.SEND_ALL);
    expect(tx.amount).toEqual(new Units('999580000000500002', 8));
    expect(tx.gasPrice.value).toEqual(new Wei(10007, EthUnits.MWEI).value);
    expect(tx.gas).toEqual(new BigNumber(42011));
    expect(tx.transferType).toEqual(TransferType.DELEGATE);
  });
});
