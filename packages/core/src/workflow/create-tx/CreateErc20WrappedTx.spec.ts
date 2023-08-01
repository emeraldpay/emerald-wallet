import { Wei } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, TokenData, TokenRegistry, amountFactory } from '../../blockchains';
import { DEFAULT_GAS_LIMIT_ERC20, EthereumTransactionType } from '../../transaction/ethereum';
import { CreateErc20WrappedTx } from './CreateErc20WrappedTx';
import { TxTarget } from './types';

describe('CreateErc20WrappedTx', () => {
  const tokenData: TokenData = {
    name: 'Wrapped Ether',
    blockchain: 100,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    decimals: 18,
    type: 'ERC20',
  };

  const tokenRegistry = new TokenRegistry([tokenData]);

  const token = tokenRegistry.byAddress(BlockchainCode.ETH, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');

  it('creates legacy tx', () => {
    const tx = new CreateErc20WrappedTx({
      token: tokenData,
      address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      blockchain: BlockchainCode.Goerli,
      totalBalance: new Wei(0),
      totalTokenBalance: token.getAmount(0),
      type: EthereumTransactionType.LEGACY,
    });

    expect(tx.amount.number.toNumber()).toBe(0);
    expect(tx.gas).toBe(DEFAULT_GAS_LIMIT_ERC20);
    expect(tx.gasPrice?.number.toNumber()).toBe(0);
    expect(tx.totalBalance.number.toNumber()).toBe(0);
  });

  it('creates eip1559 tx', () => {
    const tx = new CreateErc20WrappedTx({
      token: tokenData,
      address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      blockchain: BlockchainCode.Goerli,
      totalBalance: new Wei(0),
      totalTokenBalance: token.getAmount(0),
      type: EthereumTransactionType.EIP1559,
    });

    expect(tx.amount.number.toNumber()).toBe(0);
    expect(tx.gas).toBe(DEFAULT_GAS_LIMIT_ERC20);
    expect(tx.maxGasPrice?.number.toNumber()).toBe(0);
    expect(tx.priorityGasPrice?.number.toNumber()).toBe(0);
    expect(tx.totalBalance.number.toNumber()).toBe(0);
  });

  it('correctly rebalance ETH', () => {
    const totalBalance = amountFactory(BlockchainCode.Goerli)(10 ** 18);

    const tx = new CreateErc20WrappedTx({
      totalBalance,
      address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      blockchain: BlockchainCode.Goerli,
      token: tokenData,
      totalTokenBalance: token.getAmount(0),
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
    const tx = new CreateErc20WrappedTx({
      token: tokenData,
      address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
      amount: token.getAmount(0),
      blockchain: BlockchainCode.Goerli,
      totalBalance: new Wei(0),
      totalTokenBalance: token.getAmount(1),
      type: EthereumTransactionType.EIP1559,
    });

    expect(tx.target).toBe(TxTarget.MANUAL);
    expect(tx.amount.number.toNumber()).toBe(0);
    expect(tx.amount.units.equals(token.getUnits())).toBeTruthy();

    tx.target = TxTarget.SEND_ALL;
    tx.rebalance();

    expect(tx.target).toBe(TxTarget.SEND_ALL);
    expect(tx.amount.number.toNumber()).toBe(1);
    expect(tx.amount.units.equals(token.getUnits())).toBeTruthy();
  });
});
