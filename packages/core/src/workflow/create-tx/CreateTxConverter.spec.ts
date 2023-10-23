import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import { TokenData, TokenRegistry, amountFactory, blockchainIdToCode } from '../../blockchains';
import { DEFAULT_GAS_LIMIT, EthereumTransactionType } from '../../transaction/ethereum';
import { CreateTxConverter, FeeRange } from './CreateTxConverter';
import { TxTarget } from './types';

describe('CreateTxConverter', () => {
  const tokenData: TokenData = {
    name: 'Wrapped Ether',
    blockchain: 100,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    decimals: 18,
    type: 'ERC20',
  };

  const tokenRegistry = new TokenRegistry([tokenData]);

  const ethEntry1: EthereumEntry = {
    id: '50391c5d-a517-4b7a-9c42-1411e0603d30-0',
    address: {
      type: 'single',
      value: '0x0',
    },
    key: {
      type: 'hd-path',
      hdPath: "m/44'",
      seedId: 'c782ff2b-ba6e-43e2-9e2d-92d05cc37b03',
    },
    blockchain: 100,
    createdAt: new Date(),
  };
  const ethEntry2: EthereumEntry = {
    id: '50391c5d-a517-4b7a-9c42-1411e0603d30-1',
    address: {
      type: 'single',
      value: '0x1',
    },
    key: {
      type: 'hd-path',
      hdPath: "m/44'",
      seedId: 'c782ff2b-ba6e-43e2-9e2d-92d05cc37b03',
    },
    blockchain: 100,
    createdAt: new Date(),
  };
  const etcEntry: EthereumEntry = {
    id: '50391c5d-a517-4b7a-9c42-1411e0603d30-2',
    address: {
      type: 'single',
      value: '0x2',
    },
    key: {
      type: 'hd-path',
      hdPath: "m/44'",
      seedId: 'c782ff2b-ba6e-43e2-9e2d-92d05cc37b03',
    },
    blockchain: 101,
    createdAt: new Date(),
  };

  const toAddress = '0x3';
  const ownerAddress = '0x4';

  const feeRange: FeeRange = {
    stdMaxGasPrice: new Wei(50),
    highMaxGasPrice: new Wei(100),
    lowMaxGasPrice: new Wei(10),
    stdPriorityGasPrice: new Wei(5),
    highPriorityGasPrice: new Wei(10),
    lowPriorityGasPrice: new Wei(1),
  };
  const zeroFeeRange: FeeRange = {
    stdMaxGasPrice: Wei.ZERO,
    highMaxGasPrice: Wei.ZERO,
    lowMaxGasPrice: Wei.ZERO,
    stdPriorityGasPrice: Wei.ZERO,
    highPriorityGasPrice: Wei.ZERO,
    lowPriorityGasPrice: Wei.ZERO,
  };

  function getBalance(entry: EthereumEntry, asset: string, ownerAddress?: string): BigAmount {
    const blockchain = blockchainIdToCode(entry.blockchain);

    if (tokenRegistry.hasAddress(blockchain, asset)) {
      const token = tokenRegistry.byAddress(blockchain, asset);

      if (ownerAddress == null) {
        switch (entry.id) {
          case ethEntry1.id:
            return token.getAmount(110_000000);
          case ethEntry2.id:
            return token.getAmount(210_000000);
          case etcEntry.id:
            return token.getAmount(310_000000);
          default:
            return token.getAmount(0);
        }
      }

      switch (entry.id) {
        case ethEntry1.id:
          return token.getAmount(111_000000);
        case ethEntry2.id:
          return token.getAmount(211_000000);
        case etcEntry.id:
          return token.getAmount(311_000000);
        default:
          return token.getAmount(0);
      }
    }

    const factory = amountFactory(blockchain);

    switch (entry.id) {
      case ethEntry1.id:
        return factory(100_000000);
      case ethEntry2.id:
        return factory(200_000000);
      case etcEntry.id:
        return factory(300_000000);
      default:
        return factory(0);
    }
  }

  it('create initial ETH tx', () => {
    const { createTx } = new CreateTxConverter(
      {
        feeRange,
        asset: 'ETH',
        entry: ethEntry1,
      },
      tokenRegistry,
      getBalance,
    );

    const factory = amountFactory(blockchainIdToCode(ethEntry1.blockchain));

    expect(createTx.amount.equals(factory(0))).toBeTruthy();
    expect(createTx.from).toEqual(ethEntry1.address?.value);
    expect(createTx.target).toEqual(TxTarget.MANUAL);
    expect(createTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
    expect(createTx.type).toEqual(EthereumTransactionType.EIP1559);

    expect(createTx.gasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
    expect(createTx.maxGasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
    expect(createTx.priorityGasPrice?.equals(feeRange.stdPriorityGasPrice)).toBeTruthy();
  });

  it('create initial ERC20 tx', () => {
    const { createTx } = new CreateTxConverter(
      {
        feeRange,
        asset: tokenData.address,
        entry: ethEntry1,
      },
      tokenRegistry,
      getBalance,
    );

    const isErc20 = CreateTxConverter.isErc20CreateTx(createTx, tokenRegistry);

    expect(isErc20).toBeTruthy();

    if (isErc20) {
      const blockchain = blockchainIdToCode(ethEntry1.blockchain);

      const factory = amountFactory(blockchain);

      const token = tokenRegistry.byAddress(blockchain, tokenData.address);

      expect(createTx.amount.equals(token.getAmount(0))).toBeTruthy();
      expect(createTx.from).toEqual(ethEntry1.address?.value);
      expect(createTx.target).toEqual(TxTarget.MANUAL);
      expect(createTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
      expect(createTx.totalTokenBalance?.equals(token.getAmount(110_000000))).toBeTruthy();
      expect(createTx.type).toEqual(EthereumTransactionType.EIP1559);

      expect(createTx.gasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
      expect(createTx.maxGasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
      expect(createTx.priorityGasPrice?.equals(feeRange.stdPriorityGasPrice)).toBeTruthy();
    }
  });

  it('create initial ETC tx', () => {
    const { createTx } = new CreateTxConverter(
      {
        feeRange,
        asset: 'ETC',
        entry: etcEntry,
      },
      tokenRegistry,
      getBalance,
    );

    const factory = amountFactory(blockchainIdToCode(etcEntry.blockchain));

    expect(createTx.amount.equals(factory(0))).toBeTruthy();
    expect(createTx.from).toEqual(etcEntry.address?.value);
    expect(createTx.target).toEqual(TxTarget.MANUAL);
    expect(createTx.totalBalance?.equals(factory(300_000000))).toBeTruthy();
    expect(createTx.type).toEqual(EthereumTransactionType.LEGACY);

    expect(createTx.gasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
    expect(createTx.maxGasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
    expect(createTx.priorityGasPrice?.equals(feeRange.stdPriorityGasPrice)).toBeTruthy();
  });

  it('create initial ERC20 tx with allowance', () => {
    const { createTx } = new CreateTxConverter(
      {
        feeRange,
        ownerAddress,
        asset: tokenData.address,
        entry: ethEntry1,
      },
      tokenRegistry,
      getBalance,
    );

    const isErc20 = CreateTxConverter.isErc20CreateTx(createTx, tokenRegistry);

    expect(isErc20).toBeTruthy();

    if (isErc20) {
      const blockchain = blockchainIdToCode(ethEntry1.blockchain);

      const factory = amountFactory(blockchain);

      const token = tokenRegistry.byAddress(blockchain, tokenData.address);

      expect(createTx.amount.equals(token.getAmount(0))).toBeTruthy();
      expect(createTx.from).toEqual(ethEntry1.address?.value);
      expect(createTx.target).toEqual(TxTarget.MANUAL);
      expect(createTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
      expect(createTx.totalTokenBalance?.equals(token.getAmount(111_000000))).toBeTruthy();
      expect(createTx.transferFrom).toEqual(ownerAddress);
      expect(createTx.type).toEqual(EthereumTransactionType.EIP1559);

      expect(createTx.gasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
      expect(createTx.maxGasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
      expect(createTx.priorityGasPrice?.equals(feeRange.stdPriorityGasPrice)).toBeTruthy();
    }
  });

  it('change asset from ETH to ERC20 token', () => {
    const { createTx: ethCreateTx } = new CreateTxConverter(
      {
        feeRange,
        asset: 'ETH',
        entry: ethEntry1,
      },
      tokenRegistry,
      getBalance,
    );

    ethCreateTx.amount = new Wei(1);
    ethCreateTx.to = toAddress;

    const { createTx: erc20CreateTx } = new CreateTxConverter(
      {
        feeRange,
        asset: tokenData.address,
        entry: ethEntry1,
        transaction: ethCreateTx.dump(),
      },
      tokenRegistry,
      getBalance,
    );

    const isErc20 = CreateTxConverter.isErc20CreateTx(erc20CreateTx, tokenRegistry);

    expect(isErc20).toBeTruthy();

    if (isErc20) {
      const blockchain = blockchainIdToCode(ethEntry1.blockchain);

      const factory = amountFactory(blockchain);

      const token = tokenRegistry.byAddress(blockchain, tokenData.address);

      expect(erc20CreateTx.amount.equals(token.getAmount(0))).toBeTruthy();
      expect(erc20CreateTx.from).toEqual(ethEntry1.address?.value);
      expect(erc20CreateTx.to).toEqual(toAddress);
      expect(erc20CreateTx.target).toEqual(TxTarget.MANUAL);
      expect(erc20CreateTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
      expect(erc20CreateTx.totalTokenBalance?.equals(token.getAmount(110_000000))).toBeTruthy();
      expect(erc20CreateTx.type).toEqual(EthereumTransactionType.EIP1559);

      expect(erc20CreateTx.gasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
      expect(erc20CreateTx.maxGasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
      expect(erc20CreateTx.priorityGasPrice?.equals(feeRange.stdPriorityGasPrice)).toBeTruthy();
    }
  });

  it('change asset from ETH to ERC20 token with max amount', () => {
    const { createTx: ethCreateTx } = new CreateTxConverter(
      {
        feeRange,
        asset: 'ETH',
        entry: ethEntry1,
      },
      tokenRegistry,
      getBalance,
    );

    ethCreateTx.to = toAddress;

    ethCreateTx.target = TxTarget.SEND_ALL;
    ethCreateTx.rebalance();

    const { createTx: erc20CreateTx } = new CreateTxConverter(
      {
        feeRange,
        asset: tokenData.address,
        entry: ethEntry1,
        transaction: ethCreateTx.dump(),
      },
      tokenRegistry,
      getBalance,
    );

    const isErc20 = CreateTxConverter.isErc20CreateTx(erc20CreateTx, tokenRegistry);

    expect(isErc20).toBeTruthy();

    if (isErc20) {
      const blockchain = blockchainIdToCode(ethEntry1.blockchain);

      const factory = amountFactory(blockchain);

      const token = tokenRegistry.byAddress(blockchain, tokenData.address);

      expect(erc20CreateTx.amount.equals(token.getAmount(110_000000))).toBeTruthy();
      expect(erc20CreateTx.from).toEqual(ethEntry1.address?.value);
      expect(erc20CreateTx.to).toEqual(toAddress);
      expect(erc20CreateTx.target).toEqual(TxTarget.SEND_ALL);
      expect(erc20CreateTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
      expect(erc20CreateTx.totalTokenBalance?.equals(token.getAmount(110_000000))).toBeTruthy();
      expect(erc20CreateTx.type).toEqual(EthereumTransactionType.EIP1559);

      expect(erc20CreateTx.gasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
      expect(erc20CreateTx.maxGasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
      expect(erc20CreateTx.priorityGasPrice?.equals(feeRange.stdPriorityGasPrice)).toBeTruthy();
    }
  });

  it('change asset from ERC20 token to ETH with max amount', () => {
    const { createTx: ethCreateTx } = new CreateTxConverter(
      {
        feeRange,
        asset: tokenData.address,
        entry: ethEntry1,
      },
      tokenRegistry,
      getBalance,
    );

    ethCreateTx.to = toAddress;

    ethCreateTx.target = TxTarget.SEND_ALL;
    ethCreateTx.rebalance();

    const { createTx: erc20CreateTx } = new CreateTxConverter(
      {
        feeRange,
        asset: 'ETH',
        entry: ethEntry1,
        transaction: ethCreateTx.dump(),
      },
      tokenRegistry,
      getBalance,
    );

    expect(CreateTxConverter.isErc20CreateTx(erc20CreateTx, tokenRegistry)).toBeFalsy();

    const blockchain = blockchainIdToCode(ethEntry1.blockchain);

    const factory = amountFactory(blockchain);

    const fee = feeRange.stdMaxGasPrice.multiply(DEFAULT_GAS_LIMIT);

    expect(erc20CreateTx.amount.equals(factory(100_000000).minus(fee))).toBeTruthy();
    expect(erc20CreateTx.from).toEqual(ethEntry1.address?.value);
    expect(erc20CreateTx.to).toEqual(toAddress);
    expect(erc20CreateTx.target).toEqual(TxTarget.SEND_ALL);
    expect(erc20CreateTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
    expect(erc20CreateTx.type).toEqual(EthereumTransactionType.EIP1559);

    expect(erc20CreateTx.gasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
    expect(erc20CreateTx.maxGasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
    expect(erc20CreateTx.priorityGasPrice?.equals(feeRange.stdPriorityGasPrice)).toBeTruthy();
  });

  it('change entry from ETH to ETC', () => {
    const { createTx: ethCreateTx } = new CreateTxConverter(
      {
        asset: 'ETH',
        entry: ethEntry1,
        feeRange: zeroFeeRange,
      },
      tokenRegistry,
      getBalance,
    );

    ethCreateTx.amount = amountFactory(blockchainIdToCode(ethEntry1.blockchain))(1);
    ethCreateTx.to = toAddress;

    const { createTx: etcCreateTx } = new CreateTxConverter(
      {
        feeRange,
        asset: 'ETC',
        entry: etcEntry,
        transaction: ethCreateTx.dump(),
      },
      tokenRegistry,
      getBalance,
    );

    const factory = amountFactory(blockchainIdToCode(etcEntry.blockchain));

    expect(etcCreateTx.amount.equals(factory(0))).toBeTruthy();
    expect(etcCreateTx.from).toEqual(etcEntry.address?.value);
    expect(etcCreateTx.to).toEqual(toAddress);
    expect(etcCreateTx.target).toEqual(TxTarget.MANUAL);
    expect(etcCreateTx.totalBalance?.equals(factory(300_000000))).toBeTruthy();
    expect(etcCreateTx.type).toEqual(EthereumTransactionType.LEGACY);

    expect(etcCreateTx.gasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
    expect(etcCreateTx.maxGasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
    expect(etcCreateTx.priorityGasPrice?.equals(feeRange.stdPriorityGasPrice)).toBeTruthy();
  });

  it('change entry from ETH to other ETH', () => {
    const { createTx: eth1CreateTx } = new CreateTxConverter(
      {
        asset: 'ETH',
        entry: ethEntry1,
        feeRange: zeroFeeRange,
      },
      tokenRegistry,
      getBalance,
    );

    eth1CreateTx.amount = amountFactory(blockchainIdToCode(ethEntry1.blockchain))(1);
    eth1CreateTx.to = toAddress;

    const { createTx: eth2CreateTx } = new CreateTxConverter(
      {
        feeRange,
        asset: 'ETH',
        entry: ethEntry2,
        transaction: eth1CreateTx.dump(),
      },
      tokenRegistry,
      getBalance,
    );

    const factory = amountFactory(blockchainIdToCode(ethEntry2.blockchain));

    expect(eth2CreateTx.amount.equals(factory(1))).toBeTruthy();
    expect(eth2CreateTx.from).toEqual(ethEntry2.address?.value);
    expect(eth2CreateTx.to).toEqual(toAddress);
    expect(eth2CreateTx.target).toEqual(TxTarget.MANUAL);
    expect(eth2CreateTx.totalBalance?.equals(factory(200_000000))).toBeTruthy();
    expect(eth2CreateTx.type).toEqual(EthereumTransactionType.EIP1559);

    expect(eth2CreateTx.gasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
    expect(eth2CreateTx.maxGasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
    expect(eth2CreateTx.priorityGasPrice?.equals(feeRange.stdPriorityGasPrice)).toBeTruthy();
  });

  it('restore ETH tx', () => {
    const { createTx: ethCreateTx } = new CreateTxConverter(
      {
        feeRange,
        asset: 'ETH',
        entry: ethEntry1,
      },
      tokenRegistry,
      getBalance,
    );

    ethCreateTx.to = toAddress;

    ethCreateTx.target = TxTarget.SEND_ALL;
    ethCreateTx.rebalance();

    const { createTx: restoredEthCreateTx } = new CreateTxConverter(
      {
        feeRange,
        asset: 'ETH',
        entry: ethEntry1,
        transaction: ethCreateTx.dump(),
      },
      tokenRegistry,
      getBalance,
    );

    const factory = amountFactory(blockchainIdToCode(ethEntry1.blockchain));

    const fee = feeRange.stdMaxGasPrice.multiply(DEFAULT_GAS_LIMIT);

    expect(restoredEthCreateTx.amount.equals(factory(100_000000).minus(fee))).toBeTruthy();
    expect(restoredEthCreateTx.from).toEqual(ethEntry1.address?.value);
    expect(restoredEthCreateTx.to).toEqual(toAddress);
    expect(restoredEthCreateTx.target).toEqual(TxTarget.SEND_ALL);
    expect(restoredEthCreateTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
    expect(restoredEthCreateTx.type).toEqual(EthereumTransactionType.EIP1559);

    expect(restoredEthCreateTx.gasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
    expect(restoredEthCreateTx.maxGasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
    expect(restoredEthCreateTx.priorityGasPrice?.equals(feeRange.stdPriorityGasPrice)).toBeTruthy();
  });

  it('restore ERC20 tx', () => {
    const { createTx: erc20CreateTx } = new CreateTxConverter(
      {
        feeRange,
        asset: tokenData.address,
        entry: ethEntry1,
      },
      tokenRegistry,
      getBalance,
    );

    erc20CreateTx.to = toAddress;

    erc20CreateTx.target = TxTarget.SEND_ALL;
    erc20CreateTx.rebalance();

    const { createTx: restoredErc20CreateTx } = new CreateTxConverter(
      {
        feeRange,
        asset: tokenData.address,
        entry: ethEntry1,
        transaction: erc20CreateTx.dump(),
      },
      tokenRegistry,
      getBalance,
    );

    const isErc20 = CreateTxConverter.isErc20CreateTx(restoredErc20CreateTx, tokenRegistry);

    expect(isErc20).toBeTruthy();

    if (isErc20) {
      const blockchain = blockchainIdToCode(ethEntry1.blockchain);

      const factory = amountFactory(blockchain);

      const token = tokenRegistry.byAddress(blockchain, tokenData.address);

      expect(restoredErc20CreateTx.amount.equals(token.getAmount(110_000000))).toBeTruthy();
      expect(restoredErc20CreateTx.from).toEqual(ethEntry1.address?.value);
      expect(restoredErc20CreateTx.to).toEqual(toAddress);
      expect(restoredErc20CreateTx.target).toEqual(TxTarget.SEND_ALL);
      expect(restoredErc20CreateTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
      expect(restoredErc20CreateTx.totalTokenBalance?.equals(token.getAmount(110_000000))).toBeTruthy();
      expect(restoredErc20CreateTx.type).toEqual(EthereumTransactionType.EIP1559);

      expect(restoredErc20CreateTx.gasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
      expect(restoredErc20CreateTx.maxGasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
      expect(restoredErc20CreateTx.priorityGasPrice?.equals(feeRange.stdPriorityGasPrice)).toBeTruthy();
    }
  });

  it('restore ERC20 tx with allowance', () => {
    const { createTx: erc20CreateTx } = new CreateTxConverter(
      {
        feeRange,
        asset: tokenData.address,
        entry: ethEntry1,
      },
      tokenRegistry,
      getBalance,
    );

    erc20CreateTx.to = toAddress;

    erc20CreateTx.target = TxTarget.SEND_ALL;
    erc20CreateTx.rebalance();

    const { createTx: restoredErc20CreateTx } = new CreateTxConverter(
      {
        feeRange,
        ownerAddress,
        asset: tokenData.address,
        entry: ethEntry1,
        transaction: erc20CreateTx.dump(),
      },
      tokenRegistry,
      getBalance,
    );

    const isErc20 = CreateTxConverter.isErc20CreateTx(restoredErc20CreateTx, tokenRegistry);

    expect(isErc20).toBeTruthy();

    if (isErc20) {
      const blockchain = blockchainIdToCode(ethEntry1.blockchain);

      const factory = amountFactory(blockchain);

      const token = tokenRegistry.byAddress(blockchain, tokenData.address);

      expect(restoredErc20CreateTx.amount.equals(token.getAmount(111_000000))).toBeTruthy();
      expect(restoredErc20CreateTx.from).toEqual(ethEntry1.address?.value);
      expect(restoredErc20CreateTx.to).toEqual(toAddress);
      expect(restoredErc20CreateTx.target).toEqual(TxTarget.SEND_ALL);
      expect(restoredErc20CreateTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
      expect(restoredErc20CreateTx.totalTokenBalance?.equals(token.getAmount(111_000000))).toBeTruthy();
      expect(restoredErc20CreateTx.transferFrom).toEqual(ownerAddress);
      expect(restoredErc20CreateTx.type).toEqual(EthereumTransactionType.EIP1559);

      expect(restoredErc20CreateTx.gasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
      expect(restoredErc20CreateTx.maxGasPrice?.equals(feeRange.stdMaxGasPrice)).toBeTruthy();
      expect(restoredErc20CreateTx.priorityGasPrice?.equals(feeRange.stdPriorityGasPrice)).toBeTruthy();
    }
  });
});
