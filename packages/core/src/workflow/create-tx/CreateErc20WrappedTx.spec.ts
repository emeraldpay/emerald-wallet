import { BigAmount } from '@emeraldpay/bigamount';
import { amountFactory, BlockchainCode, TokenRegistry } from '../../blockchains';
import { EthereumTransactionType } from '../../transaction/ethereum';
import { CreateErc20WrappedTx } from './CreateErc20WrappedTx';
import { TxTarget } from './types';

describe('CreateErc20WrappedTx', () => {
  it('creates legacy tx', () => {
    const tx = new CreateErc20WrappedTx({
      address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      blockchain: BlockchainCode.Goerli,
      type: EthereumTransactionType.LEGACY,
    });

    expect(tx.amount.number.toNumber()).toBe(0);
    expect(tx.gas).toBe(50000);
    expect(tx.gasPrice?.number.toNumber()).toBe(0);
    expect(tx.totalBalance.number.toNumber()).toBe(0);
    expect(tx.totalTokenBalance).toBeUndefined();
  });

  it('creates eip1559 tx', () => {
    const tx = new CreateErc20WrappedTx({
      address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      blockchain: BlockchainCode.Goerli,
      type: EthereumTransactionType.EIP1559,
    });

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
      type: EthereumTransactionType.EIP1559,
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
    const tokenRegistry = new TokenRegistry([
      {
        name: 'Wrapped Ether',
        blockchain: 100,
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        symbol: 'WETH',
        decimals: 18,
        type: 'ERC20',
        wrapped: true,
      },
    ]);

    const wethToken = tokenRegistry.bySymbol(BlockchainCode.ETH, 'WETH');

    const tx = new CreateErc20WrappedTx({
      address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      amount: wethToken.getAmount(0),
      blockchain: BlockchainCode.Goerli,
      totalTokenBalance: wethToken.getAmount(1),
      type: EthereumTransactionType.EIP1559,
    });

    expect(tx.target).toBe(TxTarget.MANUAL);
    expect(tx.amount.number.toNumber()).toBe(0);
    expect(tx.amount.units.equals(wethToken.getUnits())).toBeTruthy();

    tx.target = TxTarget.SEND_ALL;
    tx.rebalance();

    expect(tx.target).toBe(TxTarget.SEND_ALL);
    expect(tx.amount.number.toNumber()).toBe(1);
    expect(tx.amount.units.equals(wethToken.getUnits())).toBeTruthy();
  });
});
