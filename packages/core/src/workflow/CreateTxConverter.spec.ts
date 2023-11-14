import { BigAmount } from '@emeraldpay/bigamount';
import { Satoshi, Wei } from '@emeraldpay/bigamount-crypto';
import { BitcoinEntry, EthereumEntry } from '@emeraldpay/emerald-vault-core';
import { InputUtxo, TokenData, TokenRegistry, amountFactory, blockchainIdToCode } from '../blockchains';
import { DEFAULT_GAS_LIMIT, EthereumTransactionType } from '../transaction/ethereum';
import { DEFAULT_VKB_FEE } from './CreateBitcoinTx';
import { CreateTxConverter, FeeRange } from './CreateTxConverter';
import { TxTarget, isBitcoinCreateTx, isErc20CreateTx, isEthereumCreateTx } from './types';

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

  const btcEntry: BitcoinEntry = {
    id: '7d395b44-0bac-49b9-98de-47e88dbc5a28-0',
    address: {
      type: 'xpub',
      value: 'tb1',
    },
    key: {
      type: 'hd-path',
      hdPath: "m/84'",
      seedId: 'c782ff2b-ba6e-43e2-9e2d-92d05cc37b03',
    },
    xpub: [
      {
        role: 'change',
        xpub: 'zpub1',
      },
      {
        role: 'receive',
        xpub: 'zpub2',
      },
    ],
    blockchain: 1,
    createdAt: new Date(),
    addresses: [],
  };
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

  const btcToAddress = 'tb2';

  const btcFeeRange: FeeRange = {
    std: 2048,
    min: 1024,
    max: 3096,
  };

  const ethToAddress = '0x3';
  const ethOwnerAddress = '0x4';

  const ethFeeRange: FeeRange = {
    stdMaxGasPrice: new Wei(50),
    highMaxGasPrice: new Wei(100),
    lowMaxGasPrice: new Wei(10),
    stdPriorityGasPrice: new Wei(5),
    highPriorityGasPrice: new Wei(10),
    lowPriorityGasPrice: new Wei(1),
  };
  const zeroEthFeeRange: FeeRange = {
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

  function getUtxo(entry: BitcoinEntry): InputUtxo[] {
    if (entry.id === btcEntry.id) {
      return [
        { txid: '1', address: '1', vout: 0, value: new Satoshi(11_0000000).encode() },
        { txid: '2', address: '2', vout: 0, value: new Satoshi(12_0000000).encode() },
        { txid: '3', address: '3', vout: 0, value: new Satoshi(13_0000000).encode() },
      ];
    }

    return [];
  }

  it('create initial BTC tx', () => {
    const { createTx } = new CreateTxConverter(
      {
        feeRange: ethFeeRange,
        asset: 'BTC',
        entry: btcEntry,
      },
      {
        getBalance,
        getUtxo,
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = isBitcoinCreateTx(createTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      const factory = amountFactory(blockchainIdToCode(btcEntry.blockchain));

      expect(createTx.amount.equals(factory(0))).toBeTruthy();
      expect(createTx.tx.target).toEqual(TxTarget.MANUAL);
      expect(createTx.fees.equals(factory(0))).toBeTruthy();
      expect(createTx.totalAvailable?.equals(factory(36_0000000))).toBeTruthy();
      expect(createTx.vkbPrice).toEqual(DEFAULT_VKB_FEE);
    }
  });

  it('create initial ETH tx', () => {
    const { createTx } = new CreateTxConverter(
      {
        feeRange: ethFeeRange,
        asset: 'ETH',
        entry: ethEntry1,
      },
      {
        getBalance,
        getUtxo,
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = isEthereumCreateTx(createTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      const factory = amountFactory(blockchainIdToCode(ethEntry1.blockchain));

      expect(createTx.amount.equals(factory(0))).toBeTruthy();
      expect(createTx.from).toEqual(ethEntry1.address?.value);
      expect(createTx.target).toEqual(TxTarget.MANUAL);
      expect(createTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
      expect(createTx.type).toEqual(EthereumTransactionType.EIP1559);

      expect(createTx.gasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
      expect(createTx.maxGasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
      expect(createTx.priorityGasPrice?.equals(ethFeeRange.stdPriorityGasPrice)).toBeTruthy();
    }
  });

  it('create initial ERC20 tx', () => {
    const { createTx } = new CreateTxConverter(
      {
        feeRange: ethFeeRange,
        asset: tokenData.address,
        entry: ethEntry1,
      },
      {
        getBalance,
        getUtxo,
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = isErc20CreateTx(createTx, tokenRegistry);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      const blockchain = blockchainIdToCode(ethEntry1.blockchain);

      const factory = amountFactory(blockchain);

      const token = tokenRegistry.byAddress(blockchain, tokenData.address);

      expect(createTx.amount.equals(token.getAmount(0))).toBeTruthy();
      expect(createTx.from).toEqual(ethEntry1.address?.value);
      expect(createTx.target).toEqual(TxTarget.MANUAL);
      expect(createTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
      expect(createTx.totalTokenBalance?.equals(token.getAmount(110_000000))).toBeTruthy();
      expect(createTx.type).toEqual(EthereumTransactionType.EIP1559);

      expect(createTx.gasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
      expect(createTx.maxGasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
      expect(createTx.priorityGasPrice?.equals(ethFeeRange.stdPriorityGasPrice)).toBeTruthy();
    }
  });

  it('create initial ETC tx', () => {
    const { createTx } = new CreateTxConverter(
      {
        feeRange: ethFeeRange,
        asset: 'ETC',
        entry: etcEntry,
      },
      {
        getBalance,
        getUtxo,
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = isEthereumCreateTx(createTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      const factory = amountFactory(blockchainIdToCode(etcEntry.blockchain));

      expect(createTx.amount.equals(factory(0))).toBeTruthy();
      expect(createTx.from).toEqual(etcEntry.address?.value);
      expect(createTx.target).toEqual(TxTarget.MANUAL);
      expect(createTx.totalBalance?.equals(factory(300_000000))).toBeTruthy();
      expect(createTx.type).toEqual(EthereumTransactionType.LEGACY);

      expect(createTx.gasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
      expect(createTx.maxGasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
      expect(createTx.priorityGasPrice?.equals(ethFeeRange.stdPriorityGasPrice)).toBeTruthy();
    }
  });

  it('create initial ERC20 tx with allowance', () => {
    const { createTx } = new CreateTxConverter(
      {
        feeRange: ethFeeRange,
        ownerAddress: ethOwnerAddress,
        asset: tokenData.address,
        entry: ethEntry1,
      },
      {
        getBalance,
        getUtxo,
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = isErc20CreateTx(createTx, tokenRegistry);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      const blockchain = blockchainIdToCode(ethEntry1.blockchain);

      const factory = amountFactory(blockchain);

      const token = tokenRegistry.byAddress(blockchain, tokenData.address);

      expect(createTx.amount.equals(token.getAmount(0))).toBeTruthy();
      expect(createTx.from).toEqual(ethEntry1.address?.value);
      expect(createTx.target).toEqual(TxTarget.MANUAL);
      expect(createTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
      expect(createTx.totalTokenBalance?.equals(token.getAmount(111_000000))).toBeTruthy();
      expect(createTx.transferFrom).toEqual(ethOwnerAddress);
      expect(createTx.type).toEqual(EthereumTransactionType.EIP1559);

      expect(createTx.gasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
      expect(createTx.maxGasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
      expect(createTx.priorityGasPrice?.equals(ethFeeRange.stdPriorityGasPrice)).toBeTruthy();
    }
  });

  it('change asset from ETH to ERC20 token', () => {
    const { createTx: ethCreateTx } = new CreateTxConverter(
      {
        feeRange: ethFeeRange,
        asset: 'ETH',
        entry: ethEntry1,
      },
      {
        getBalance,
        getUtxo,
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = isEthereumCreateTx(ethCreateTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      ethCreateTx.amount = new Wei(1);
      ethCreateTx.to = ethToAddress;

      const { createTx: erc20CreateTx } = new CreateTxConverter(
        {
          feeRange: ethFeeRange,
          asset: tokenData.address,
          entry: ethEntry1,
          transaction: ethCreateTx.dump(),
        },
        {
          getBalance,
          getUtxo,
        },
        tokenRegistry,
      );

      const isConvertedCreateTx = isErc20CreateTx(erc20CreateTx, tokenRegistry);

      expect(isConvertedCreateTx).toBeTruthy();

      if (isConvertedCreateTx) {
        const blockchain = blockchainIdToCode(ethEntry1.blockchain);

        const factory = amountFactory(blockchain);

        const token = tokenRegistry.byAddress(blockchain, tokenData.address);

        expect(erc20CreateTx.amount.equals(token.getAmount(0))).toBeTruthy();
        expect(erc20CreateTx.from).toEqual(ethEntry1.address?.value);
        expect(erc20CreateTx.to).toEqual(ethToAddress);
        expect(erc20CreateTx.target).toEqual(TxTarget.MANUAL);
        expect(erc20CreateTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
        expect(erc20CreateTx.totalTokenBalance?.equals(token.getAmount(110_000000))).toBeTruthy();
        expect(erc20CreateTx.type).toEqual(EthereumTransactionType.EIP1559);

        expect(erc20CreateTx.gasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(erc20CreateTx.maxGasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(erc20CreateTx.priorityGasPrice?.equals(ethFeeRange.stdPriorityGasPrice)).toBeTruthy();
      }
    }
  });

  it('change asset from ETH to ERC20 token with max amount', () => {
    const { createTx: ethCreateTx } = new CreateTxConverter(
      {
        feeRange: ethFeeRange,
        asset: 'ETH',
        entry: ethEntry1,
      },
      {
        getBalance,
        getUtxo,
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = isEthereumCreateTx(ethCreateTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      ethCreateTx.to = ethToAddress;

      ethCreateTx.target = TxTarget.SEND_ALL;
      ethCreateTx.rebalance();

      const { createTx: erc20CreateTx } = new CreateTxConverter(
        {
          feeRange: ethFeeRange,
          asset: tokenData.address,
          entry: ethEntry1,
          transaction: ethCreateTx.dump(),
        },
        {
          getBalance,
          getUtxo,
        },
        tokenRegistry,
      );

      const isConvertedCreateTx = isErc20CreateTx(erc20CreateTx, tokenRegistry);

      expect(isConvertedCreateTx).toBeTruthy();

      if (isConvertedCreateTx) {
        const blockchain = blockchainIdToCode(ethEntry1.blockchain);

        const factory = amountFactory(blockchain);

        const token = tokenRegistry.byAddress(blockchain, tokenData.address);

        expect(erc20CreateTx.amount.equals(token.getAmount(110_000000))).toBeTruthy();
        expect(erc20CreateTx.from).toEqual(ethEntry1.address?.value);
        expect(erc20CreateTx.to).toEqual(ethToAddress);
        expect(erc20CreateTx.target).toEqual(TxTarget.SEND_ALL);
        expect(erc20CreateTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
        expect(erc20CreateTx.totalTokenBalance?.equals(token.getAmount(110_000000))).toBeTruthy();
        expect(erc20CreateTx.type).toEqual(EthereumTransactionType.EIP1559);

        expect(erc20CreateTx.gasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(erc20CreateTx.maxGasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(erc20CreateTx.priorityGasPrice?.equals(ethFeeRange.stdPriorityGasPrice)).toBeTruthy();
      }
    }
  });

  it('change asset from ERC20 token to ETH with max amount', () => {
    const { createTx: erc20CreateTx } = new CreateTxConverter(
      {
        feeRange: ethFeeRange,
        asset: tokenData.address,
        entry: ethEntry1,
      },
      {
        getBalance,
        getUtxo,
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = isErc20CreateTx(erc20CreateTx, tokenRegistry);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      erc20CreateTx.to = ethToAddress;

      erc20CreateTx.target = TxTarget.SEND_ALL;
      erc20CreateTx.rebalance();

      const { createTx: ethCreateTx } = new CreateTxConverter(
        {
          feeRange: ethFeeRange,
          asset: 'ETH',
          entry: ethEntry1,
          transaction: erc20CreateTx.dump(),
        },
        {
          getBalance,
          getUtxo,
        },
        tokenRegistry,
      );

      const isConvertedCreateTx = isEthereumCreateTx(ethCreateTx);

      expect(isConvertedCreateTx).toBeTruthy();

      if (isConvertedCreateTx) {
        const blockchain = blockchainIdToCode(ethEntry1.blockchain);

        const factory = amountFactory(blockchain);

        const fee = ethFeeRange.stdMaxGasPrice.multiply(DEFAULT_GAS_LIMIT);

        expect(ethCreateTx.amount.equals(factory(100_000000).minus(fee))).toBeTruthy();
        expect(ethCreateTx.from).toEqual(ethEntry1.address?.value);
        expect(ethCreateTx.to).toEqual(ethToAddress);
        expect(ethCreateTx.target).toEqual(TxTarget.SEND_ALL);
        expect(ethCreateTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
        expect(ethCreateTx.type).toEqual(EthereumTransactionType.EIP1559);

        expect(ethCreateTx.gasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(ethCreateTx.maxGasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(ethCreateTx.priorityGasPrice?.equals(ethFeeRange.stdPriorityGasPrice)).toBeTruthy();
      }
    }
  });

  it('change entry from BTC to ETH', () => {
    const { createTx: btcCreateTx } = new CreateTxConverter(
      {
        asset: 'BTC',
        entry: btcEntry,
        feeRange: btcFeeRange,
      },
      {
        getBalance,
        getUtxo,
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = isBitcoinCreateTx(btcCreateTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      btcCreateTx.amount = new Satoshi(1);
      btcCreateTx.to = btcToAddress;

      const { createTx: ethCreateTx } = new CreateTxConverter(
        {
          feeRange: ethFeeRange,
          asset: 'ETH',
          entry: ethEntry1,
          transaction: btcCreateTx.dump(),
        },
        {
          getBalance,
          getUtxo,
        },
        tokenRegistry,
      );

      const isConvertedCreateTx = isEthereumCreateTx(ethCreateTx);

      expect(isConvertedCreateTx).toBeTruthy();

      if (isConvertedCreateTx) {
        const factory = amountFactory(blockchainIdToCode(ethEntry1.blockchain));

        expect(ethCreateTx.amount.equals(factory(0))).toBeTruthy();
        expect(ethCreateTx.from).toEqual(ethEntry1.address?.value);
        expect(ethCreateTx.to).not.toEqual(btcToAddress);
        expect(ethCreateTx.target).toEqual(TxTarget.MANUAL);
        expect(ethCreateTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
        expect(ethCreateTx.type).toEqual(EthereumTransactionType.EIP1559);

        expect(ethCreateTx.gasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(ethCreateTx.maxGasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(ethCreateTx.priorityGasPrice?.equals(ethFeeRange.stdPriorityGasPrice)).toBeTruthy();
      }
    }
  });

  it('change entry from ETH to BTC', () => {
    const { createTx: ethCreateTx } = new CreateTxConverter(
      {
        feeRange: ethFeeRange,
        asset: 'ETH',
        entry: ethEntry1,
      },
      {
        getBalance,
        getUtxo,
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = isEthereumCreateTx(ethCreateTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      ethCreateTx.amount = new Wei(1);
      ethCreateTx.to = ethToAddress;

      const { createTx: btcCreateTx } = new CreateTxConverter(
        {
          asset: 'BTC',
          entry: btcEntry,
          feeRange: btcFeeRange,
          transaction: ethCreateTx.dump(),
        },
        {
          getBalance,
          getUtxo,
        },
        tokenRegistry,
      );

      const isConvertedCreateTx = isBitcoinCreateTx(btcCreateTx);

      expect(isConvertedCreateTx).toBeTruthy();

      if (isConvertedCreateTx) {
        const factory = amountFactory(blockchainIdToCode(btcEntry.blockchain));

        expect(btcCreateTx.amount.equals(factory(0))).toBeTruthy();
        expect(btcCreateTx.tx.to).not.toEqual(ethToAddress);
        expect(btcCreateTx.tx.target).toEqual(TxTarget.MANUAL);
        expect(btcCreateTx.fees.equals(factory(0))).toBeTruthy();
        expect(btcCreateTx.totalAvailable?.equals(factory(36_0000000))).toBeTruthy();
        expect(btcCreateTx.vkbPrice).toEqual(btcFeeRange.std);
      }
    }
  });

  it('change entry from ETH to ETC', () => {
    const { createTx: ethCreateTx } = new CreateTxConverter(
      {
        asset: 'ETH',
        entry: ethEntry1,
        feeRange: zeroEthFeeRange,
      },
      {
        getBalance,
        getUtxo,
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = isEthereumCreateTx(ethCreateTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      ethCreateTx.amount = new Wei(1);
      ethCreateTx.to = ethToAddress;

      const { createTx: etcCreateTx } = new CreateTxConverter(
        {
          feeRange: ethFeeRange,
          asset: 'ETC',
          entry: etcEntry,
          transaction: ethCreateTx.dump(),
        },
        {
          getBalance,
          getUtxo,
        },
        tokenRegistry,
      );

      const isConvertedCreateTx = isEthereumCreateTx(etcCreateTx);

      expect(isConvertedCreateTx).toBeTruthy();

      if (isConvertedCreateTx) {
        const factory = amountFactory(blockchainIdToCode(etcEntry.blockchain));

        expect(etcCreateTx.amount.equals(factory(0))).toBeTruthy();
        expect(etcCreateTx.from).toEqual(etcEntry.address?.value);
        expect(etcCreateTx.to).toEqual(ethToAddress);
        expect(etcCreateTx.target).toEqual(TxTarget.MANUAL);
        expect(etcCreateTx.totalBalance?.equals(factory(300_000000))).toBeTruthy();
        expect(etcCreateTx.type).toEqual(EthereumTransactionType.LEGACY);

        expect(etcCreateTx.gasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(etcCreateTx.maxGasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(etcCreateTx.priorityGasPrice?.equals(ethFeeRange.stdPriorityGasPrice)).toBeTruthy();
      }
    }
  });

  it('change entry from ETH to other ETH', () => {
    const { createTx: eth1CreateTx } = new CreateTxConverter(
      {
        asset: 'ETH',
        entry: ethEntry1,
        feeRange: zeroEthFeeRange,
      },
      {
        getBalance,
        getUtxo,
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = isEthereumCreateTx(eth1CreateTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      eth1CreateTx.amount = new Wei(1);
      eth1CreateTx.to = ethToAddress;

      const { createTx: eth2CreateTx } = new CreateTxConverter(
        {
          feeRange: ethFeeRange,
          asset: 'ETH',
          entry: ethEntry2,
          transaction: eth1CreateTx.dump(),
        },
        {
          getBalance,
          getUtxo,
        },
        tokenRegistry,
      );

      const isConvertedCreateTx = isEthereumCreateTx(eth2CreateTx);

      expect(isConvertedCreateTx).toBeTruthy();

      if (isConvertedCreateTx) {
        const factory = amountFactory(blockchainIdToCode(ethEntry2.blockchain));

        expect(eth2CreateTx.amount.equals(factory(1))).toBeTruthy();
        expect(eth2CreateTx.from).toEqual(ethEntry2.address?.value);
        expect(eth2CreateTx.to).toEqual(ethToAddress);
        expect(eth2CreateTx.target).toEqual(TxTarget.MANUAL);
        expect(eth2CreateTx.totalBalance?.equals(factory(200_000000))).toBeTruthy();
        expect(eth2CreateTx.type).toEqual(EthereumTransactionType.EIP1559);

        expect(eth2CreateTx.gasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(eth2CreateTx.maxGasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(eth2CreateTx.priorityGasPrice?.equals(ethFeeRange.stdPriorityGasPrice)).toBeTruthy();
      }
    }
  });

  it('restore ETH tx', () => {
    const { createTx: ethCreateTx } = new CreateTxConverter(
      {
        feeRange: ethFeeRange,
        asset: 'ETH',
        entry: ethEntry1,
      },
      {
        getBalance,
        getUtxo,
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = isEthereumCreateTx(ethCreateTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      ethCreateTx.to = ethToAddress;

      ethCreateTx.target = TxTarget.SEND_ALL;
      ethCreateTx.rebalance();

      const { createTx: restoredEthCreateTx } = new CreateTxConverter(
        {
          feeRange: ethFeeRange,
          asset: 'ETH',
          entry: ethEntry1,
          transaction: ethCreateTx.dump(),
        },
        {
          getBalance,
          getUtxo,
        },
        tokenRegistry,
      );

      const isConvertedCreateTx = isEthereumCreateTx(restoredEthCreateTx);

      expect(isConvertedCreateTx).toBeTruthy();

      if (isConvertedCreateTx) {
        const factory = amountFactory(blockchainIdToCode(ethEntry1.blockchain));

        const fee = ethFeeRange.stdMaxGasPrice.multiply(DEFAULT_GAS_LIMIT);

        expect(restoredEthCreateTx.amount.equals(factory(100_000000).minus(fee))).toBeTruthy();
        expect(restoredEthCreateTx.from).toEqual(ethEntry1.address?.value);
        expect(restoredEthCreateTx.to).toEqual(ethToAddress);
        expect(restoredEthCreateTx.target).toEqual(TxTarget.SEND_ALL);
        expect(restoredEthCreateTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
        expect(restoredEthCreateTx.type).toEqual(EthereumTransactionType.EIP1559);

        expect(restoredEthCreateTx.gasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(restoredEthCreateTx.maxGasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(restoredEthCreateTx.priorityGasPrice?.equals(ethFeeRange.stdPriorityGasPrice)).toBeTruthy();
      }
    }
  });

  it('restore ERC20 tx', () => {
    const { createTx: erc20CreateTx } = new CreateTxConverter(
      {
        feeRange: ethFeeRange,
        asset: tokenData.address,
        entry: ethEntry1,
      },
      {
        getBalance,
        getUtxo,
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = isErc20CreateTx(erc20CreateTx, tokenRegistry);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      erc20CreateTx.to = ethToAddress;

      erc20CreateTx.target = TxTarget.SEND_ALL;
      erc20CreateTx.rebalance();

      const { createTx: restoredErc20CreateTx } = new CreateTxConverter(
        {
          feeRange: ethFeeRange,
          asset: tokenData.address,
          entry: ethEntry1,
          transaction: erc20CreateTx.dump(),
        },
        {
          getBalance,
          getUtxo,
        },
        tokenRegistry,
      );

      const isConvertedCreateTx = isErc20CreateTx(restoredErc20CreateTx, tokenRegistry);

      expect(isConvertedCreateTx).toBeTruthy();

      if (isConvertedCreateTx) {
        const blockchain = blockchainIdToCode(ethEntry1.blockchain);

        const factory = amountFactory(blockchain);

        const token = tokenRegistry.byAddress(blockchain, tokenData.address);

        expect(restoredErc20CreateTx.amount.equals(token.getAmount(110_000000))).toBeTruthy();
        expect(restoredErc20CreateTx.from).toEqual(ethEntry1.address?.value);
        expect(restoredErc20CreateTx.to).toEqual(ethToAddress);
        expect(restoredErc20CreateTx.target).toEqual(TxTarget.SEND_ALL);
        expect(restoredErc20CreateTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
        expect(restoredErc20CreateTx.totalTokenBalance?.equals(token.getAmount(110_000000))).toBeTruthy();
        expect(restoredErc20CreateTx.type).toEqual(EthereumTransactionType.EIP1559);

        expect(restoredErc20CreateTx.gasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(restoredErc20CreateTx.maxGasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(restoredErc20CreateTx.priorityGasPrice?.equals(ethFeeRange.stdPriorityGasPrice)).toBeTruthy();
      }
    }
  });

  it('restore ERC20 tx with allowance', () => {
    const { createTx: erc20CreateTx } = new CreateTxConverter(
      {
        feeRange: ethFeeRange,
        asset: tokenData.address,
        entry: ethEntry1,
      },
      {
        getBalance,
        getUtxo,
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = isErc20CreateTx(erc20CreateTx, tokenRegistry);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      erc20CreateTx.to = ethToAddress;

      erc20CreateTx.target = TxTarget.SEND_ALL;
      erc20CreateTx.rebalance();

      const { createTx: restoredErc20CreateTx } = new CreateTxConverter(
        {
          feeRange: ethFeeRange,
          ownerAddress: ethOwnerAddress,
          asset: tokenData.address,
          entry: ethEntry1,
          transaction: erc20CreateTx.dump(),
        },
        {
          getBalance,
          getUtxo,
        },
        tokenRegistry,
      );

      const isConvertedCreateTx = isErc20CreateTx(restoredErc20CreateTx, tokenRegistry);

      expect(isConvertedCreateTx).toBeTruthy();

      if (isConvertedCreateTx) {
        const blockchain = blockchainIdToCode(ethEntry1.blockchain);

        const factory = amountFactory(blockchain);

        const token = tokenRegistry.byAddress(blockchain, tokenData.address);

        expect(restoredErc20CreateTx.amount.equals(token.getAmount(111_000000))).toBeTruthy();
        expect(restoredErc20CreateTx.from).toEqual(ethEntry1.address?.value);
        expect(restoredErc20CreateTx.to).toEqual(ethToAddress);
        expect(restoredErc20CreateTx.target).toEqual(TxTarget.SEND_ALL);
        expect(restoredErc20CreateTx.totalBalance?.equals(factory(100_000000))).toBeTruthy();
        expect(restoredErc20CreateTx.totalTokenBalance?.equals(token.getAmount(111_000000))).toBeTruthy();
        expect(restoredErc20CreateTx.transferFrom).toEqual(ethOwnerAddress);
        expect(restoredErc20CreateTx.type).toEqual(EthereumTransactionType.EIP1559);

        expect(restoredErc20CreateTx.gasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(restoredErc20CreateTx.maxGasPrice?.equals(ethFeeRange.stdMaxGasPrice)).toBeTruthy();
        expect(restoredErc20CreateTx.priorityGasPrice?.equals(ethFeeRange.stdPriorityGasPrice)).toBeTruthy();
      }
    }
  });
});
