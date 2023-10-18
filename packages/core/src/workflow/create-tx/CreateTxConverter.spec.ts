import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import { TokenRegistry, amountFactory, blockchainIdToCode } from '../../blockchains';
import { EthereumTransactionType } from '../../transaction/ethereum';
import { CreateTxConverter, FeeRange } from './CreateTxConverter';
import { TxTarget } from './types';

describe('CreateTxConverter', () => {
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

  const feeRange: FeeRange = {
    stdMaxGasPrice: new Wei(1000, 'MWEI'),
    highMaxGasPrice: new Wei(2000, 'MWEI'),
    lowMaxGasPrice: new Wei(500, 'MWEI'),
    stdPriorityGasPrice: new Wei(100, 'MWEI'),
    highPriorityGasPrice: new Wei(150, 'MWEI'),
    lowPriorityGasPrice: new Wei(50, 'MWEI'),
  };

  function getBalance(entry: EthereumEntry, asset: string, ownerAddress?: string): BigAmount {
    const blockchain = blockchainIdToCode(entry.blockchain);

    if (tokenRegistry.hasAddress(blockchain, asset)) {
      const token = tokenRegistry.byAddress(blockchain, asset);

      if (ownerAddress == null) {
        switch (entry.id) {
          case ethEntry1.id:
            return token.getAmount(1010);
          case ethEntry2.id:
            return token.getAmount(2010);
          case etcEntry.id:
            return token.getAmount(3010);
          default:
            return token.getAmount(10);
        }
      }

      switch (entry.id) {
        case ethEntry1.id:
          return token.getAmount(1011);
        case ethEntry2.id:
          return token.getAmount(2011);
        case etcEntry.id:
          return token.getAmount(3011);
        default:
          return token.getAmount(11);
      }
    }

    const factory = amountFactory(blockchain);

    switch (entry.id) {
      case ethEntry1.id:
        return factory(1000);
      case ethEntry2.id:
        return factory(2000);
      case etcEntry.id:
        return factory(3000);
      default:
        return factory(0);
    }
  }

  it('create initial tx', () => {
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
    expect(createTx.totalBalance?.equals(factory(1000))).toBeTruthy();
    expect(createTx.type).toEqual(EthereumTransactionType.EIP1559);
  });

  it('create initial ERC20 tx', () => {
    const { createTx } = new CreateTxConverter(
      {
        feeRange,
        asset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
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
      const token = tokenRegistry.byAddress(blockchain, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');

      expect(createTx.amount.equals(token.getAmount(0))).toBeTruthy();
      expect(createTx.from).toEqual(ethEntry1.address?.value);
      expect(createTx.target).toEqual(TxTarget.MANUAL);
      expect(createTx.totalBalance?.equals(factory(1000))).toBeTruthy();
      expect(createTx.totalTokenBalance?.equals(token.getAmount(1010))).toBeTruthy();
      expect(createTx.type).toEqual(EthereumTransactionType.EIP1559);
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
        asset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
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
      const token = tokenRegistry.byAddress(blockchain, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');

      expect(erc20CreateTx.amount.equals(token.getAmount(0))).toBeTruthy();
      expect(erc20CreateTx.from).toEqual(ethEntry1.address?.value);
      expect(erc20CreateTx.to).toEqual(toAddress);
      expect(erc20CreateTx.target).toEqual(TxTarget.MANUAL);
      expect(erc20CreateTx.totalBalance?.equals(factory(1000))).toBeTruthy();
      expect(erc20CreateTx.totalTokenBalance?.equals(token.getAmount(1010))).toBeTruthy();
      expect(erc20CreateTx.type).toEqual(EthereumTransactionType.EIP1559);
    }
  });

  it('change entry from ETH to ETC', () => {
    const { createTx: ethCreateTx } = new CreateTxConverter(
      {
        feeRange,
        asset: 'ETH',
        entry: ethEntry1,
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
    expect(etcCreateTx.totalBalance?.equals(factory(3000))).toBeTruthy();
    expect(etcCreateTx.type).toEqual(EthereumTransactionType.LEGACY);
  });

  it('change entry from ETH to other ETH', () => {
    const { createTx: eth1CreateTx } = new CreateTxConverter(
      {
        feeRange,
        asset: 'ETH',
        entry: ethEntry1,
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
    expect(eth2CreateTx.totalBalance?.equals(factory(2000))).toBeTruthy();
    expect(eth2CreateTx.type).toEqual(EthereumTransactionType.EIP1559);
  });
});
