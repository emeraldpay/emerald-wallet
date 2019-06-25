import {CreateERC20Tx, ERC20TxDetailsPlain, TransferType} from './CreateErc20Tx';
import {TxTarget, ValidationResult} from './types';
import {Units, Wei} from "@emeraldplatform/eth";
import BigNumber from 'bignumber.js';
import {CreateEthereumTx, TxDetailsPlain} from "./CreateEthereumTx";

describe('CreateErc20Tx', () => {
  it('creates tx', () => {
    const tx = new CreateERC20Tx();

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
    expect(tx.target).toBe(TxTarget.MANUAL);
    expect(tx.transferType).toBe(TransferType.STANDARD);
    expect(tx.amount.toString()).toBe("0");
  });

  it('invalid without from', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));
    tx.from = undefined;

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
  });
  it('invalid without balance', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));
    tx.totalEtherBalance = undefined;

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
  });
  it('invalid without token balance', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));
    tx.totalTokenBalance = undefined;

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
  });

  it('invalid without to', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));

    expect(tx.validate()).toBe(ValidationResult.NO_TO);
  });

  it('invalid without enough tokens', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));
    tx.to = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.amount = new BigNumber(101);

    expect(tx.validate()).toBe(ValidationResult.INSUFFICIENT_TOKEN_FUNDS);
  });

  it('invalid without enough ether', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.WEI));
    tx.to = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.gasPrice = new Wei(10000, Units.MWEI);
    tx.amount = new BigNumber(100);

    expect(tx.validate()).toBe(ValidationResult.INSUFFICIENT_FUNDS);
  });

  it('valid', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));
    tx.to = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.gasPrice = new Wei(10000, Units.MWEI);
    tx.amount = new BigNumber(100);

    expect(tx.validate()).toBe(ValidationResult.OK);
  });

  it('zero change', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));
    tx.to = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.gasPrice = new Wei(10000, Units.MWEI);
    tx.amount = new BigNumber(100);

    expect(tx.getChange()).toBeDefined();
    expect(tx.getChange() || '?').toEqual(new BigNumber(0));
  });

  it('has change', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));
    tx.to = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.gasPrice = new Wei(10000, Units.MWEI);
    tx.amount = new BigNumber(50);

    expect(tx.getChange()).toBeDefined();
    expect(tx.getChange() || '?').toEqual(new BigNumber(50));
  });

  it('change is null if total not set', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));
    tx.totalTokenBalance = undefined;
    tx.to = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.gasPrice = new Wei(10000, Units.MWEI);
    tx.amount = new BigNumber(50);

    expect(tx.getChange()).toBeNull();
  });

  it('fees', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));
    tx.to = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.gasPrice = new Wei(10000, Units.MWEI);
    tx.gas = new BigNumber(150000);
    tx.amount = new BigNumber(100);

    expect(tx.getFees()).toBeDefined();
    expect((tx.getFees() || '?').toString()).toEqual('0.0015');
  });

  it('fees are calculated if total not set', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));
    tx.totalEtherBalance = undefined;
    tx.to = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.gasPrice = new Wei(10000, Units.MWEI);
    tx.gas = new BigNumber(150000);
    tx.amount = new BigNumber(100);

    expect(tx.getFees()).toBeDefined();
    expect((tx.getFees() || '?').toString()).toEqual('0.0015');
  });

  it('fees change', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));
    tx.to = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.gasPrice = new Wei(10000, Units.MWEI);
    tx.gas = new BigNumber(150000);
    tx.amount = new BigNumber(100);

    expect(tx.getFeesChange()).toBeDefined();
    expect((tx.getFeesChange() || '?').toString()).toEqual('0.9985');
  });

  it('fees change are null if total not set', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));
    tx.totalEtherBalance = undefined;
    tx.to = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.gasPrice = new Wei(10000, Units.MWEI);
    tx.gas = new BigNumber(150000);
    tx.amount = new BigNumber(100);

    expect(tx.getFeesChange()).toBeNull();
  });

  it('rebalance to max sets max', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));
    tx.to = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.amount = new BigNumber(20);
    tx.target = TxTarget.SEND_ALL;

    expect(tx.getTotal()).toEqual(new BigNumber(20));
    expect(tx.rebalance()).toBeTruthy();
    expect(tx.getTotal()).toEqual(new BigNumber(100));
  });

  it('rebalance to manual doenst change amount', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));
    tx.to = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.amount = new BigNumber(20);
    tx.target = TxTarget.MANUAL;

    console.log(tx.debug());

    expect(tx.getTotal()).toEqual(new BigNumber(20));
    expect(tx.rebalance()).toBeTruthy();
    expect(tx.getTotal()).toEqual(new BigNumber(20));
  });

  it('doesnt rebalance if total not set', () => {
    const tx = new CreateERC20Tx();
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));
    tx.totalTokenBalance = undefined;
    tx.to = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.amount = new BigNumber(20);
    tx.target = TxTarget.SEND_ALL;


    expect(tx.getTotal()).toEqual(new BigNumber(20));
    expect(tx.rebalance()).toBeFalsy();
    expect(tx.getTotal()).toEqual(new BigNumber(20));
  });

  it ('dumps plain', () => {
    const tx = new CreateERC20Tx();
    tx.erc20 = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new BigNumber(100), new Wei(1, Units.ETHER));
    tx.to = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.amount = new BigNumber(20);
    tx.gasPrice = new Wei(10007, Units.MWEI);
    tx.gas = new BigNumber(42011);
    tx.target = TxTarget.SEND_ALL;

    const dump = tx.dump();

    console.log('dump', dump);

    expect(dump.from).toBe('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(dump.erc20).toBe('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(dump.totalEtherBalance).toBe('1000000000000000000');
    expect(dump.totalTokenBalance).toBe('100');
    expect(dump.to).toBe('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(dump.target).toBe(1);
    expect(dump.amount).toBe('20');
    expect(dump.gasPrice).toBe('10007000000');
    expect(dump.gas).toBe(42011);
    expect(dump.transferType).toBe(0);
  });

  it ('reads from dumps', () => {
    const dump: ERC20TxDetailsPlain = {
      from: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      erc20: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      totalEtherBalance: '1000000000057',
      totalTokenBalance: '2000000000015',
      to: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      target: 1,
      amount: '999580000000500002',
      gasPrice: '10007000000',
      gas: 42011,
      transferType: 0
    };

    const tx = CreateERC20Tx.fromPlain(dump);

    expect(tx.from).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.totalEtherBalance != null ? tx.totalEtherBalance.value : null).toEqual(new Wei("1000000000057", Units.WEI).value);
    expect(tx.totalTokenBalance != null ? tx.totalTokenBalance : null).toEqual(new BigNumber("2000000000015"));
    expect(tx.erc20).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.to).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.target).toEqual(TxTarget.SEND_ALL);
    expect(tx.amount).toEqual(new BigNumber("999580000000500002"));
    expect(tx.gasPrice.value).toEqual(new Wei(10007, Units.MWEI).value);
    expect(tx.gas).toEqual(new BigNumber(42011));
    expect(tx.transferType).toEqual(TransferType.STANDARD);
  });

  it ('reads from dumps - delegate mode', () => {
    const dump: ERC20TxDetailsPlain = {
      from: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      erc20: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      totalEtherBalance: '1000000000057',
      totalTokenBalance: '2000000000015',
      to: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      target: 1,
      amount: '999580000000500002',
      gasPrice: '10007000000',
      gas: 42011,
      transferType: 1
    };

    const tx = CreateERC20Tx.fromPlain(dump);

    expect(tx.from).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.totalEtherBalance != null ? tx.totalEtherBalance.value : null).toEqual(new Wei("1000000000057", Units.WEI).value);
    expect(tx.totalTokenBalance != null ? tx.totalTokenBalance : null).toEqual(new BigNumber("2000000000015"));
    expect(tx.erc20).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.to).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.target).toEqual(TxTarget.SEND_ALL);
    expect(tx.amount).toEqual(new BigNumber("999580000000500002"));
    expect(tx.gasPrice.value).toEqual(new Wei(10007, Units.MWEI).value);
    expect(tx.gas).toEqual(new BigNumber(42011));
    expect(tx.transferType).toEqual(TransferType.DELEGATE);
  });
});