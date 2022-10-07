import { BigAmount } from '@emeraldpay/bigamount';
import { CreateErc20WrappedTx } from './CreateErc20WrappedTx';
import { TxTarget } from './types';
import { BlockchainCode, amountFactory, tokenUnits } from '../../blockchains';

describe('CreateErc20WrappedTx', () => {
  it('creates legacy tx', () => {
    const tx = new CreateErc20WrappedTx({
      address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      blockchain: BlockchainCode.Goerli,
    });

    expect(tx.amount.number.toNumber()).toBe(0);
    expect(tx.gas).toBe(50000);
    expect(tx.gasPrice?.number.toNumber()).toBe(0);
    expect(tx.totalBalance.number.toNumber()).toBe(0);
    expect(tx.totalTokenBalance).toBeUndefined();
  });

  it('creates eip1559 tx', () => {
    const tx = new CreateErc20WrappedTx(
      {
        address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
        blockchain: BlockchainCode.Goerli,
      },
      true,
    );

    expect(tx.amount.number.toNumber()).toBe(0);
    expect(tx.gas).toBe(50000);
    expect(tx.maxGasPrice?.number.toNumber()).toBe(0);
    expect(tx.priorityGasPrice?.number.toNumber()).toBe(0);
    expect(tx.totalBalance.number.toNumber()).toBe(0);
    expect(tx.totalTokenBalance).toBeUndefined();
  });

  it('correctly rebalance ETH', () => {
    const totalBalance = amountFactory(BlockchainCode.Goerli)(10 ** 18);

    const tx = new CreateErc20WrappedTx({
      totalBalance,
      address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      blockchain: BlockchainCode.Goerli,
    });

    expect(tx.target).toBe(TxTarget.MANUAL);
    expect(tx.amount.number.toNumber()).toBe(0);
    expect(tx.amount.units.equals(totalBalance.units)).toBeTruthy();

    tx.target = TxTarget.SEND_ALL;
    tx.rebalance();

    expect(tx.target).toBe(TxTarget.SEND_ALL);
    expect(tx.amount.number.toString()).toBe('1000000000000000000');
    expect(tx.amount.units.equals(totalBalance.units)).toBeTruthy();
  });

  it('correctly rebalance WETH', () => {
    const units = tokenUnits('WETH');

    const tx = new CreateErc20WrappedTx({
      address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      amount: new BigAmount(0, units),
      blockchain: BlockchainCode.Goerli,
      totalTokenBalance: new BigAmount(1, units),
    });

    expect(tx.target).toBe(TxTarget.MANUAL);
    expect(tx.amount.number.toNumber()).toBe(0);
    expect(tx.amount.units.equals(units)).toBeTruthy();

    tx.target = TxTarget.SEND_ALL;
    tx.rebalance();

    expect(tx.target).toBe(TxTarget.SEND_ALL);
    expect(tx.amount.number.toNumber()).toBe(1);
    expect(tx.amount.units.equals(units)).toBeTruthy();
  });
});
