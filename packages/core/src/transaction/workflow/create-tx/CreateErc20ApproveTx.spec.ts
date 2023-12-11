import { Wei } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, INFINITE_ALLOWANCE, TokenData, TokenRegistry } from '../../../blockchains';
import { DEFAULT_GAS_LIMIT_ERC20, EthereumTransactionType } from '../../ethereum';
import { TxMetaType, ValidationResult } from '../types';
import { ApproveTarget, CreateErc20ApproveTx } from './CreateErc20ApproveTx';

describe('CreateErc20ApproveTx', () => {
  const wethTokenData: TokenData = {
    name: 'Wrapped Ether',
    blockchain: 10005,
    address: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    symbol: 'WETG',
    decimals: 18,
    type: 'ERC20',
  };
  const weenusTokenData: TokenData = {
    name: 'Weenus',
    blockchain: 10005,
    address: '0xaFF4481D10270F50f203E0763e2597776068CBc5',
    symbol: 'WEENUS',
    decimals: 18,
    type: 'ERC20',
    stablecoin: true,
  };

  const tokenRegistry = new TokenRegistry([wethTokenData, weenusTokenData]);

  const wethToken = tokenRegistry.byAddress(BlockchainCode.Goerli, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6');
  const weenusToken = tokenRegistry.byAddress(BlockchainCode.Goerli, '0xaFF4481D10270F50f203E0763e2597776068CBc5');

  test('should create legacy approve tx', () => {
    const tx = new CreateErc20ApproveTx(tokenRegistry, {
      amount: wethToken.getAmount(0),
      asset: wethToken.address,
      blockchain: BlockchainCode.Goerli,
      meta: { type: TxMetaType.ERC20_APPROVE },
      target: ApproveTarget.MANUAL,
      type: EthereumTransactionType.LEGACY,
    });

    expect(tx.amount.number.toNumber()).toEqual(0);
    expect(tx.gas).toBe(DEFAULT_GAS_LIMIT_ERC20);
    expect(tx.gasPrice?.number.toNumber()).toEqual(0);
    expect(tx.totalBalance.number.toNumber()).toEqual(0);
  });

  test('should create eip1559 approve tx', () => {
    const tx = new CreateErc20ApproveTx(tokenRegistry, {
      amount: wethToken.getAmount(0),
      asset: wethToken.address,
      blockchain: BlockchainCode.Goerli,
      meta: { type: TxMetaType.ERC20_APPROVE },
      target: ApproveTarget.MANUAL,
      type: EthereumTransactionType.EIP1559,
    });

    expect(tx.amount.number.toNumber()).toEqual(0);
    expect(tx.gas).toEqual(DEFAULT_GAS_LIMIT_ERC20);
    expect(tx.maxGasPrice?.number.toNumber()).toEqual(0);
    expect(tx.priorityGasPrice?.number.toNumber()).toEqual(0);
    expect(tx.totalBalance.number.toNumber()).toEqual(0);
  });

  test('should set target', () => {
    const amount = wethToken.getAmount(3);

    let tx = new CreateErc20ApproveTx(tokenRegistry, {
      amount: wethToken.getAmount(0),
      asset: wethToken.address,
      blockchain: BlockchainCode.Goerli,
      meta: { type: TxMetaType.ERC20_APPROVE },
      target: ApproveTarget.MAX_AVAILABLE,
      totalTokenBalance: amount,
      type: EthereumTransactionType.EIP1559,
    });

    expect(tx.amount.equals(amount)).toBeTruthy();

    tx = new CreateErc20ApproveTx(tokenRegistry, {
      amount: wethToken.getAmount(0),
      asset: wethToken.address,
      blockchain: BlockchainCode.Goerli,
      meta: { type: TxMetaType.ERC20_APPROVE },
      target: ApproveTarget.INFINITE,
      type: EthereumTransactionType.EIP1559,
    });

    expect(tx.amount.number.eq(INFINITE_ALLOWANCE)).toBeTruthy();
  });

  test('should change amount and target', () => {
    const amount = wethToken.getAmount(1);

    const tx = new CreateErc20ApproveTx(tokenRegistry, {
      amount: wethToken.getAmount(0),
      asset: wethToken.address,
      blockchain: BlockchainCode.Goerli,
      meta: { type: TxMetaType.ERC20_APPROVE },
      target: ApproveTarget.MANUAL,
      totalTokenBalance: amount,
      type: EthereumTransactionType.EIP1559,
    });

    tx.target = ApproveTarget.MAX_AVAILABLE;

    expect(tx.amount.equals(amount)).toBeTruthy();

    tx.target = ApproveTarget.INFINITE;

    expect(tx.amount.number.eq(INFINITE_ALLOWANCE)).toBeTruthy();

    tx.amount = amount;

    expect(tx.target).toEqual(ApproveTarget.MANUAL);
  });

  test('should change token', () => {
    const amount = wethToken.getAmount(1);

    const tx = new CreateErc20ApproveTx(tokenRegistry, {
      amount,
      asset: wethToken.address,
      blockchain: BlockchainCode.Goerli,
      meta: { type: TxMetaType.ERC20_APPROVE },
      target: ApproveTarget.MANUAL,
      totalTokenBalance: amount,
      type: EthereumTransactionType.EIP1559,
    });

    const weenusAmount = weenusToken.getAmount(1);

    tx.setToken(weenusToken, new Wei(0), weenusAmount, true);

    expect(tx.token.symbol).toEqual(weenusToken.symbol);
    expect(tx.amount.number.eq(weenusAmount.number)).toBeTruthy();
    expect(tx.totalTokenBalance.equals(weenusAmount)).toBeTruthy();
  });

  test('should validate tx', () => {
    const tx = new CreateErc20ApproveTx(tokenRegistry, {
      amount: wethToken.getAmount(0),
      asset: wethToken.address,
      blockchain: BlockchainCode.Goerli,
      meta: { type: TxMetaType.ERC20_APPROVE },
      target: ApproveTarget.MANUAL,
      type: EthereumTransactionType.EIP1559,
    });

    expect(tx.validate()).toEqual(ValidationResult.NO_FROM);

    tx.approveBy = '0xe62c6f33a58d7f49e6b782aab931450e53d01f12';

    expect(tx.validate()).toEqual(ValidationResult.NO_TO);

    tx.allowFor = '0x3f54eb67fea225d0a21263f1a7cb456e342cb1e8';

    expect(tx.validate()).toEqual(ValidationResult.OK);
  });

  test('should build tx', () => {
    const tx = new CreateErc20ApproveTx(tokenRegistry, {
      amount: wethToken.getAmount(0),
      approveBy: '0xe62c6f33a58d7f49e6b782aab931450e53d01f12',
      allowFor: '0x3f54eb67fea225d0a21263f1a7cb456e342cb1e8',
      asset: wethToken.address,
      blockchain: BlockchainCode.Goerli,
      meta: { type: TxMetaType.ERC20_APPROVE },
      target: ApproveTarget.MANUAL,
      type: EthereumTransactionType.EIP1559,
    });

    expect(tx.build().data?.length).toBeGreaterThan(2);
  });
});
