import BigNumber from 'bignumber.js';
import {CreateERC20Tx, TransferType} from './CreateErc20Tx';
import {ITxDetailsPlain, TxTarget, ValidationResult} from './types';
import {Wei} from "@emeraldpay/bigamount-crypto";
import {tokenAmount} from "../../blockchains";

describe('CreateErc20Tx', () => {
  it('creates tx', () => {
    const tx = new CreateERC20Tx("DAI");

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
    expect(tx.target).toBe(TxTarget.MANUAL);
    expect(tx.transferType).toBe(TransferType.STANDARD);
    expect(tx.amount.number.toString()).toBe('0');
  });

  it('invalid without from', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));
    tx.from = undefined;

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
  });
  it('invalid without balance', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));
    tx.totalEtherBalance = undefined;

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
  });
  it('invalid without token balance', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));
    tx.totalTokenBalance = undefined;

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
  });

  it('invalid without to', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));

    expect(tx.validate()).toBe(ValidationResult.NO_TO);
  });

  it('invalid without enough tokens', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.amount = tokenAmount(101, "dai");

    expect(tx.validate()).toBe(ValidationResult.INSUFFICIENT_TOKEN_FUNDS);
  });

  it('invalid without enough ether', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), new Wei(1));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.amount = tokenAmount(100, "dai");
    console.log("tx", tx);
    expect(tx.validate()).toBe(ValidationResult.INSUFFICIENT_FUNDS);
  });

  it('valid', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.amount = tokenAmount(100, "dai");

    expect(tx.validate()).toBe(ValidationResult.OK);
  });

  it('zero change', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.amount = tokenAmount(100, "dai");

    expect(tx.getChange()).toBeDefined();
    expect(tx.getChange() || '?').toEqual(tokenAmount(0, "dai"));
  });

  it('has change', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.amount = tokenAmount(50, "dai");

    expect(tx.getChange()).toBeDefined();
    expect(tx.getChange() || '?').toEqual(tokenAmount(50, "dai"));
  });

  it('change is null if total not set', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));
    tx.totalTokenBalance = undefined;
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.amount = tokenAmount(50, "dai");

    expect(tx.getChange()).toBeNull();
  });

  it('fees', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.gas = new BigNumber(150000);
    tx.amount = tokenAmount(100, "dai");

    expect(tx.getFees()).toBeDefined();
    expect((tx.getFees() || '?').toString()).toEqual('1.5 mETH');
  });

  it('fees are calculated if total not set', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));
    tx.totalEtherBalance = undefined;
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.gas = new BigNumber(150000);
    tx.amount = tokenAmount(100, "dai");

    expect(tx.getFees()).toBeDefined();
    expect((tx.getFees() || '?').toString()).toEqual('1.5 mETH');
  });

  it('fees change', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.gas = new BigNumber(150000);
    tx.amount = tokenAmount(100, "dai");

    expect(tx.getFeesChange()).toBeDefined();
    expect((tx.getFeesChange() || '?').toString()).toEqual('998.5 mETH');
  });

  it('fees change are null if total not set', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));
    tx.totalEtherBalance = undefined;
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.gasPrice = new Wei(10000, "MWEI");
    tx.gas = new BigNumber(150000);
    tx.amount = tokenAmount(100, "dai");

    expect(tx.getFeesChange()).toBeNull();
  });

  it('rebalance to max sets max', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.amount = tokenAmount(20, "dai");
    tx.target = TxTarget.SEND_ALL;

    expect(tx.getTotal()).toEqual(tokenAmount(20, "dai"));
    expect(tx.rebalance()).toBeTruthy();
    expect(tx.getTotal()).toEqual(tokenAmount(100, "dai"));
  });

  it('rebalance to manual does not change amount', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.amount = tokenAmount(20, "dai");
    tx.target = TxTarget.MANUAL;

    expect(tx.getTotal()).toEqual(tokenAmount(20, "dai"));
    expect(tx.rebalance()).toBeTruthy();
    expect(tx.getTotal()).toEqual(tokenAmount(20, "dai"));
  });

  it('doesnt rebalance if total not set', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));
    tx.totalTokenBalance = undefined;
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.amount = tokenAmount(20, "dai");
    tx.target = TxTarget.SEND_ALL;

    expect(tx.getTotal()).toEqual(tokenAmount(20, "dai"));
    expect(tx.rebalance()).toBeFalsy();
    expect(tx.getTotal()).toEqual(tokenAmount(20, "dai"));
  });

  it('dumps plain', () => {
    const tx = new CreateERC20Tx("DAI");
    tx.erc20 = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', tokenAmount(100, "dai"), Wei.fromEther(1));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.amount = tokenAmount(20, "dai");
    tx.gasPrice = new Wei(10007, "MWEI");
    tx.gas = new BigNumber(42011);
    tx.target = TxTarget.SEND_ALL;

    const dump = tx.dump();

    expect(dump.from).toBe('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(dump.erc20).toBe('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(dump.totalEtherBalance).toBe('1000000000000000000/WEI');
    expect(dump.totalTokenBalance).toBe('100/DAI');
    expect(dump.to).toBe('0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd');
    expect(dump.target).toBe(1);
    expect(dump.amount).toBe('20/DAI');
    expect(dump.gasPrice).toBe('10007000000/WEI');
    expect(dump.gas).toBe(42011);
    expect(dump.transferType).toBe(0);
  });

  it('reads from dumps', () => {
    const dump: ITxDetailsPlain = {
      from: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      erc20: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      totalEtherBalance: '1000000000057/WEI',
      totalTokenBalance: '2000000000015/DAI',
      amountDecimals: 8,
      to: '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd',
      target: 1,
      amount: '999580000000500002/DAI',
      gasPrice: '10007000000/WEI',
      gas: 42011,
      transferType: 0,
      tokenSymbol: 'DAI'
    };

    const tx = CreateERC20Tx.fromPlain(dump);

    expect(tx.from).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.totalEtherBalance != null ? tx.totalEtherBalance : null)
      .toEqual(new Wei('1000000000057', "WEI"));
    expect(tx.totalTokenBalance).toEqual(tokenAmount('2000000000015', 'dai'));
    expect(tx.erc20).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.to).toEqual('0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd');
    expect(tx.target).toEqual(TxTarget.SEND_ALL);
    expect(tx.amount).toEqual(tokenAmount('999580000000500002', 'dai'));
    expect(tx.gasPrice).toEqual(new Wei(10007, "MWEI"));
    expect(tx.gas).toEqual(new BigNumber(42011));
    expect(tx.transferType).toEqual(TransferType.STANDARD);
  });

  it('reads from dumps - delegate mode', () => {
    const dump: ITxDetailsPlain = {
      from: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      erc20: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      totalEtherBalance: '1000000000057/WEI',
      totalTokenBalance: '2000000000015/DAI',
      amountDecimals: 8,
      to: '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd',
      target: 1,
      amount: '999580000000500002/DAI',
      gasPrice: '10007000000/WEI',
      gas: 42011,
      transferType: 1,
      tokenSymbol: 'DAI'
    };

    const tx = CreateERC20Tx.fromPlain(dump);

    expect(tx.from).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.totalEtherBalance != null ? tx.totalEtherBalance : null)
      .toEqual(new Wei('1000000000057'));
    expect(tx.totalTokenBalance != null ? tx.totalTokenBalance : null).toEqual(tokenAmount('2000000000015', 'dai'));
    expect(tx.erc20).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.to).toEqual('0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd');
    expect(tx.target).toEqual(TxTarget.SEND_ALL);
    expect(tx.amount).toEqual(tokenAmount('999580000000500002', 'dai'));
    expect(tx.gasPrice).toEqual(new Wei(10007, "MWEI"));
    expect(tx.gas).toEqual(new BigNumber(42011));
    expect(tx.transferType).toEqual(TransferType.DELEGATE);
  });
});
