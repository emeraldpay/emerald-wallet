import { Wei } from '@emeraldpay/bigamount-crypto';
import { CreateERC20Tx, TransferType } from './CreateErc20Tx';
import { TxDetailsPlain, TxTarget, ValidationResult } from './types';
import { BlockchainCode, TokenRegistry } from '../../blockchains';

describe('CreateErc20Tx', () => {
  const tokenRegistry = new TokenRegistry([
    {
      name: 'Dai Stablecoin',
      blockchain: 100,
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      decimals: 18,
      type: 'ERC20',
      stablecoin: true,
    },
  ]);

  const daiToken = tokenRegistry.bySymbol(BlockchainCode.ETH, 'dai');

  it('creates tx', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
    expect(tx.target).toBe(TxTarget.MANUAL);
    expect(tx.transferType).toBe(TransferType.STANDARD);
    expect(tx.amount.number.toString()).toBe('0');
  });

  it('invalid without from', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));
    tx.from = undefined;

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
  });

  it('invalid without balance', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));
    tx.totalBalance = undefined;

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
  });

  it('invalid without token balance', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));
    tx.totalTokenBalance = undefined;

    expect(tx.validate()).toBe(ValidationResult.NO_FROM);
  });

  it('invalid without to', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));

    expect(tx.validate()).toBe(ValidationResult.NO_TO);
  });

  it('invalid without enough tokens', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.amount = daiToken.getAmount(101);

    expect(tx.validate()).toBe(ValidationResult.INSUFFICIENT_TOKEN_FUNDS);
  });

  it('invalid without enough ether', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', new Wei(1), daiToken.getAmount(100));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.maxGasPrice = new Wei(10000, 'MWEI');
    tx.priorityGasPrice = new Wei(5000, 'MWEI');
    tx.amount = daiToken.getAmount(100);
    console.log('tx', tx);
    expect(tx.validate()).toBe(ValidationResult.INSUFFICIENT_FUNDS);
  });

  it('valid', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.maxGasPrice = new Wei(10000, 'MWEI');
    tx.priorityGasPrice = new Wei(5000, 'MWEI');
    tx.amount = daiToken.getAmount(100);

    expect(tx.validate()).toBe(ValidationResult.OK);
  });

  it('zero change', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.maxGasPrice = new Wei(10000, 'MWEI');
    tx.priorityGasPrice = new Wei(5000, 'MWEI');
    tx.amount = daiToken.getAmount(100);

    expect(tx.getChange()).toBeDefined();
    expect(tx.getChange() || '?').toEqual(daiToken.getAmount(0));
  });

  it('has change', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.maxGasPrice = new Wei(10000, 'MWEI');
    tx.priorityGasPrice = new Wei(5000, 'MWEI');
    tx.amount = daiToken.getAmount(50);

    expect(tx.getChange()).toBeDefined();
    expect(tx.getChange() || '?').toEqual(daiToken.getAmount(50));
  });

  it('change is null if total not set', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));
    tx.totalTokenBalance = undefined;
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.maxGasPrice = new Wei(10000, 'MWEI');
    tx.priorityGasPrice = new Wei(5000, 'MWEI');
    tx.amount = daiToken.getAmount(50);

    expect(tx.getChange()).toBeNull();
  });

  it('fees', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.maxGasPrice = new Wei(10000, 'MWEI');
    tx.priorityGasPrice = new Wei(5000, 'MWEI');
    tx.gas = 150000;
    tx.amount = daiToken.getAmount(100);

    expect(tx.getFees()).toBeDefined();
    expect((tx.getFees() || '?').toString()).toEqual('1.5 mETH');
  });

  it('fees are calculated if total not set', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));
    tx.totalBalance = undefined;
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.maxGasPrice = new Wei(10000, 'MWEI');
    tx.priorityGasPrice = new Wei(5000, 'MWEI');
    tx.gas = 150000;
    tx.amount = daiToken.getAmount(100);

    expect(tx.getFees()).toBeDefined();
    expect((tx.getFees() || '?').toString()).toEqual('1.5 mETH');
  });

  it('fees change', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.maxGasPrice = new Wei(10000, 'MWEI');
    tx.priorityGasPrice = new Wei(5000, 'MWEI');
    tx.gas = 150000;
    tx.amount = daiToken.getAmount(100);

    expect(tx.getFeesChange()).toBeDefined();
    expect((tx.getFeesChange() || '?').toString()).toEqual('998.5 mETH');
  });

  it('fees change are null if total not set', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));
    tx.totalBalance = undefined;
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.maxGasPrice = new Wei(10000, 'MWEI');
    tx.priorityGasPrice = new Wei(5000, 'MWEI');
    tx.gas = 150000;
    tx.amount = daiToken.getAmount(100);

    expect(tx.getFeesChange()).toBeNull();
  });

  it('rebalance to max sets max', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.amount = daiToken.getAmount(20);
    tx.target = TxTarget.SEND_ALL;

    expect(tx.getTotal()).toEqual(daiToken.getAmount(20));
    expect(tx.rebalance()).toBeTruthy();
    expect(tx.getTotal()).toEqual(daiToken.getAmount(100));
  });

  it('rebalance to manual does not change amount', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.amount = daiToken.getAmount(20);
    tx.target = TxTarget.MANUAL;

    expect(tx.getTotal()).toEqual(daiToken.getAmount(20));
    expect(tx.rebalance()).toBeTruthy();
    expect(tx.getTotal()).toEqual(daiToken.getAmount(20));
  });

  it('doesnt rebalance if total not set', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));
    tx.totalTokenBalance = undefined;
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.amount = daiToken.getAmount(20);
    tx.target = TxTarget.SEND_ALL;

    expect(tx.getTotal()).toEqual(daiToken.getAmount(20));
    expect(tx.rebalance()).toBeFalsy();
    expect(tx.getTotal()).toEqual(daiToken.getAmount(20));
  });

  it('dumps plain', () => {
    const tx = new CreateERC20Tx(tokenRegistry, 'DAI', BlockchainCode.ETH);
    tx.erc20 = '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD';
    tx.setFrom('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD', Wei.fromEther(1), daiToken.getAmount(100));
    tx.to = '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd';
    tx.amount = daiToken.getAmount(20);
    tx.maxGasPrice = new Wei(10007, 'MWEI');
    tx.priorityGasPrice = new Wei(5007, 'MWEI');
    tx.gas = 42011;
    tx.target = TxTarget.SEND_ALL;

    const dump = tx.dump();

    expect(dump.from).toBe('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(dump.erc20).toBe('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(dump.totalEtherBalance).toBe('1000000000000000000/WEI');
    expect(dump.totalTokenBalance).toBe('100/DAI');
    expect(dump.to).toBe('0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd');
    expect(dump.target).toBe(1);
    expect(dump.amount).toBe('20/DAI');
    expect(dump.maxGasPrice).toBe('10007000000/WEI');
    expect(dump.priorityGasPrice).toBe('5007000000/WEI');
    expect(dump.gas).toBe(42011);
    expect(dump.transferType).toBe(0);
  });

  it('reads from dumps', () => {
    const dump: TxDetailsPlain = {
      amount: '999580000000500002/DAI',
      amountDecimals: 8,
      blockchain: BlockchainCode.ETH,
      erc20: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      from: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      gas: 42011,
      maxGasPrice: '10007000000/WEI',
      priorityGasPrice: '5007000000/WEI',
      target: 1,
      to: '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd',
      tokenSymbol: 'DAI',
      totalEtherBalance: '1000000000057/WEI',
      totalTokenBalance: '2000000000015/DAI',
      transferType: 0,
      type: '0x2',
    };

    const tx = CreateERC20Tx.fromPlain(tokenRegistry, dump);

    expect(tx.from).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.totalBalance != null ? tx.totalBalance : null).toEqual(new Wei('1000000000057', 'WEI'));
    expect(tx.totalTokenBalance).toEqual(daiToken.getAmount('2000000000015'));
    expect(tx.erc20).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.to).toEqual('0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd');
    expect(tx.target).toEqual(TxTarget.SEND_ALL);
    expect(tx.amount).toEqual(daiToken.getAmount('999580000000500002'));
    expect(tx.maxGasPrice).toEqual(new Wei(10007, 'MWEI'));
    expect(tx.priorityGasPrice).toEqual(new Wei(5007, 'MWEI'));
    expect(tx.gas).toEqual(42011);
    expect(tx.transferType).toEqual(TransferType.STANDARD);
  });

  it('reads from dumps - delegate mode', () => {
    const dump: TxDetailsPlain = {
      amount: '999580000000500002/DAI',
      amountDecimals: 8,
      blockchain: BlockchainCode.ETH,
      erc20: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      from: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      gas: 42011,
      maxGasPrice: '10007000000/WEI',
      priorityGasPrice: '5007000000/WEI',
      target: 1,
      to: '0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd',
      tokenSymbol: 'DAI',
      totalEtherBalance: '1000000000057/WEI',
      totalTokenBalance: '2000000000015/DAI',
      transferType: 1,
      type: '0x2',
    };

    const tx = CreateERC20Tx.fromPlain(tokenRegistry, dump);

    expect(tx.from).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.totalBalance != null ? tx.totalBalance : null).toEqual(new Wei('1000000000057'));
    expect(tx.totalTokenBalance != null ? tx.totalTokenBalance : null).toEqual(daiToken.getAmount('2000000000015'));
    expect(tx.erc20).toEqual('0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD');
    expect(tx.to).toEqual('0x2af2d8be60ca2c0f21497bb57b0037d44b8df3bd');
    expect(tx.target).toEqual(TxTarget.SEND_ALL);
    expect(tx.amount).toEqual(daiToken.getAmount('999580000000500002'));
    expect(tx.maxGasPrice).toEqual(new Wei(10007, 'MWEI'));
    expect(tx.priorityGasPrice).toEqual(new Wei(5007, 'MWEI'));
    expect(tx.gas).toEqual(42011);
    expect(tx.transferType).toEqual(TransferType.DELEGATE);
  });
});
