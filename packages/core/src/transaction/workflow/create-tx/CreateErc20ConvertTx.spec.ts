import { Wei, WeiAny } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, CoinTicker, TokenRegistry, amountFactory } from '../../../blockchains';
import { DEFAULT_GAS_LIMIT_ERC20, EthereumTransactionType } from '../../ethereum';
import { TxMetaType, TxTarget } from '../types';
import { CreateErc20ConvertTx } from './CreateErc20ConvertTx';

describe('CreateErc20ConvertTx', () => {
  const tokenRegistry = new TokenRegistry([
    {
      name: 'Wrapped Ether',
      blockchain: 100,
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      decimals: 18,
      type: 'ERC20',
    },
  ]);

  const token = tokenRegistry.byAddress(BlockchainCode.ETH, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');

  it('creates legacy tx', () => {
    const tx = new CreateErc20ConvertTx(
      {
        address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
        amount: new Wei(0),
        asset: token.address,
        blockchain: BlockchainCode.ETH,
        meta: { type: TxMetaType.ERC20_CONVERT },
        target: TxTarget.MANUAL,
        totalBalance: new Wei(0),
        totalTokenBalance: token.getAmount(0),
        type: EthereumTransactionType.LEGACY,
      },
      tokenRegistry,
    );

    expect(tx.amount.number.toNumber()).toBe(0);
    expect(tx.gas).toBe(DEFAULT_GAS_LIMIT_ERC20);
    expect(tx.gasPrice?.number.toNumber()).toBe(0);
    expect(tx.totalBalance.number.toNumber()).toBe(0);
  });

  it('creates eip1559 tx', () => {
    const tx = new CreateErc20ConvertTx(
      {
        address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
        amount: new Wei(0),
        asset: token.address,
        blockchain: BlockchainCode.ETH,
        meta: { type: TxMetaType.ERC20_CONVERT },
        target: TxTarget.MANUAL,
        totalBalance: new Wei(0),
        totalTokenBalance: token.getAmount(0),
        type: EthereumTransactionType.EIP1559,
      },
      tokenRegistry,
    );

    expect(tx.amount.number.toNumber()).toBe(0);
    expect(tx.gas).toBe(DEFAULT_GAS_LIMIT_ERC20);
    expect(tx.maxGasPrice?.number.toNumber()).toBe(0);
    expect(tx.priorityGasPrice?.number.toNumber()).toBe(0);
    expect(tx.totalBalance.number.toNumber()).toBe(0);
  });

  it('correctly rebalance ETH', () => {
    const totalBalance = amountFactory(BlockchainCode.ETH)(10 ** 18) as WeiAny;

    const tx = new CreateErc20ConvertTx(
      {
        totalBalance,
        address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
        amount: new Wei(0),
        asset: CoinTicker.ETH,
        blockchain: BlockchainCode.ETH,
        meta: { type: TxMetaType.ERC20_CONVERT },
        target: TxTarget.MANUAL,
        totalTokenBalance: token.getAmount(0),
        type: EthereumTransactionType.EIP1559,
      },
      tokenRegistry,
    );

    expect(tx.target).toBe(TxTarget.MANUAL);
    expect(tx.amount.number.toNumber()).toBe(0);

    tx.target = TxTarget.SEND_ALL;
    tx.rebalance();

    expect(tx.target).toBe(TxTarget.SEND_ALL);
    expect(tx.amount.equals(totalBalance)).toBeTruthy();
  });

  it('correctly rebalance WETH', () => {
    const tx = new CreateErc20ConvertTx(
      {
        address: '0x2C80BfA8E69fdd12853Fd010A520B29cfa01E2cD',
        amount: token.getAmount(0),
        asset: token.address,
        blockchain: BlockchainCode.ETH,
        meta: { type: TxMetaType.ERC20_CONVERT },
        target: TxTarget.MANUAL,
        totalBalance: new Wei(0),
        totalTokenBalance: token.getAmount(1),
        type: EthereumTransactionType.EIP1559,
      },
      tokenRegistry,
    );

    expect(tx.target).toBe(TxTarget.MANUAL);
    expect(tx.amount.equals(token.getAmount(0))).toBeTruthy();

    tx.target = TxTarget.SEND_ALL;
    tx.rebalance();

    expect(tx.target).toBe(TxTarget.SEND_ALL);
    expect(tx.amount.equals(token.getAmount(1))).toBeTruthy();
  });
});
