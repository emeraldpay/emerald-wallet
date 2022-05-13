import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { tokenUnits } from '../../blockchains/tokens';
import { CreateErc20WrappedTx } from './CreateErc20WrappedTx';
import { TxTarget } from './types';

describe('CreateErc20WrappedTx', () => {
  it('creates legacy tx', () => {
    const tx = new CreateErc20WrappedTx({ address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD' });

    expect(tx.amount.number.toNumber()).toBe(0);
    expect(tx.gas.toNumber()).toBe(50000);
    expect(tx.gasPrice.number.toNumber()).toBe(0);
    expect(tx.totalBalance.number.toNumber()).toBe(0);
    expect(tx.totalTokenBalance).toBeUndefined();
  });

  it('creates eip1559 tx', () => {
    const tx = new CreateErc20WrappedTx({ address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD' }, true);

    expect(tx.amount.number.toNumber()).toBe(0);
    expect(tx.gas.toNumber()).toBe(50000);
    expect(tx.maxGasPrice.number.toNumber()).toBe(0);
    expect(tx.priorityGasPrice.number.toNumber()).toBe(0);
    expect(tx.totalBalance.number.toNumber()).toBe(0);
    expect(tx.totalTokenBalance).toBeUndefined();
  });

  it('correctly rebalance ETH', () => {
    const tx = new CreateErc20WrappedTx({
      address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      totalBalance: new Wei(10 ** 18),
    });

    expect(tx.target).toBe(TxTarget.MANUAL);
    expect(tx.amount.number.toNumber()).toBe(0);

    tx.target = TxTarget.SEND_ALL;
    tx.rebalance();

    expect(tx.target).toBe(TxTarget.SEND_ALL);
    expect(tx.amount.number.toString()).toBe('1000000000000000000');
  });

  it('correctly rebalance WETH', () => {
    const units = tokenUnits('WETH');

    const tx = new CreateErc20WrappedTx({
      address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      amount: new BigAmount(0, units),
      totalTokenBalance: new BigAmount(1, units),
    });

    expect(tx.target).toBe(TxTarget.MANUAL);
    expect(tx.amount.number.toNumber()).toBe(0);

    tx.target = TxTarget.SEND_ALL;
    tx.rebalance();

    expect(tx.target).toBe(TxTarget.SEND_ALL);
    expect(tx.amount.number.toNumber()).toBe(1);
  });
});
