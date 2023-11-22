import { BigAmount } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import {
  BitcoinEntry,
  EthereumEntry,
  WalletEntry,
  isBitcoinEntry,
  isEthereumEntry,
} from '@emeraldpay/emerald-vault-core';
import {
  Blockchains,
  InputUtxo,
  TokenRegistry,
  amountFactory,
  blockchainIdToCode,
  isBitcoin,
  isEthereum,
} from '../../blockchains';
import { EthereumTransactionType } from '../ethereum';
import { CreateBitcoinTx, CreateErc20Tx, CreateEthereumTx } from './create-tx';
import {
  AnyCreateTx,
  AnyErc20CreateTx,
  AnyEthereumCreateTx,
  fromBitcoinPlainTx,
  fromErc20PlainTx,
  fromEthereumPlainTx,
  isAnyErc20CreateTx,
  isErc20CreateTx,
  isEthereumCreateTx,
} from './create-tx/types';
import {
  BitcoinPlainTx,
  EthereumPlainTx,
  FeeRange,
  TxTarget,
  isBitcoinFeeRange,
  isBitcoinPlainTx,
  isEthereumFeeRange,
} from './types';

interface BuilderOrigin {
  asset: string;
  changeAddress?: string;
  entry: WalletEntry;
  feeRange: FeeRange;
  ownerAddress?: string;
  transaction?: BitcoinPlainTx | EthereumPlainTx;
}

interface DataProvider {
  getBalance(entry: WalletEntry, asset: string, ownerAddress?: string): BigAmount;
  getUtxo(entry: BitcoinEntry): InputUtxo[];
}

type EthereumBasicCreateTx = CreateEthereumTx | CreateErc20Tx;

export class TxBuilder implements BuilderOrigin {
  readonly asset: string;
  readonly changeAddress?: string;
  readonly entry: WalletEntry;
  readonly feeRange: FeeRange;
  readonly ownerAddress?: string;
  readonly transaction?: BitcoinPlainTx | EthereumPlainTx;

  private readonly dataProvider: DataProvider;
  private readonly tokenRegistry: TokenRegistry;

  constructor(origin: BuilderOrigin, dataProvider: DataProvider, tokenRegistry: TokenRegistry) {
    const { asset, changeAddress, entry, feeRange, ownerAddress, transaction } = origin;

    this.asset = asset;
    this.changeAddress = changeAddress;
    this.entry = entry;
    this.feeRange = feeRange;
    this.ownerAddress = ownerAddress;
    this.transaction = transaction;

    this.dataProvider = dataProvider;
    this.tokenRegistry = tokenRegistry;
  }

  get createTx(): AnyCreateTx {
    const { asset, changeAddress, entry, feeRange, tokenRegistry, transaction } = this;

    const blockchain = blockchainIdToCode(entry.blockchain);

    let createTx: AnyCreateTx;

    if (
      transaction == null ||
      (isBitcoin(blockchain) && isEthereum(transaction.blockchain)) ||
      (isEthereum(blockchain) && isBitcoin(transaction.blockchain))
    ) {
      if (isBitcoinEntry(entry)) {
        createTx = this.initBitcoinTx(entry);
      } else {
        if (tokenRegistry.hasAddress(blockchain, asset)) {
          createTx = this.initErc20Tx(entry);
        } else {
          createTx = this.initEthereumTx(entry);
        }

        createTx.from = entry.address?.value;

        if (isEthereumFeeRange(feeRange)) {
          createTx.gasPrice = feeRange.stdMaxGasPrice;
          createTx.maxGasPrice = feeRange.stdMaxGasPrice;
          createTx.priorityGasPrice = feeRange.stdPriorityGasPrice;
        }

        createTx.type =
          Blockchains[blockchain].params.eip1559 ?? false
            ? EthereumTransactionType.EIP1559
            : EthereumTransactionType.LEGACY;
      }
    } else {
      if (isBitcoinPlainTx(transaction)) {
        if (isEthereumEntry(entry)) {
          throw new Error('Ethereum entry provided for Bitcoin transaction');
        }

        createTx = fromBitcoinPlainTx(transaction, { blockchain, changeAddress, entryId: entry.id });
      } else {
        if (isBitcoinEntry(entry)) {
          throw new Error('Bitcoin entry provided for Ethereum transaction');
        }

        if (tokenRegistry.hasAddress(blockchain, transaction.asset)) {
          createTx = fromErc20PlainTx(transaction, tokenRegistry);
        } else {
          createTx = fromEthereumPlainTx(transaction);
        }

        if (isEthereumCreateTx(createTx) || isErc20CreateTx(createTx)) {
          if (asset !== createTx.getAsset() || blockchain !== createTx.blockchain) {
            return this.convertEthereumTx(createTx);
          }

          this.populateEthereumTx(createTx, transaction);
        }
      }
    }

    return createTx;
  }

  private initBitcoinTx(entry: BitcoinEntry): CreateBitcoinTx {
    const {
      changeAddress,
      feeRange,
      dataProvider: { getUtxo },
    } = this;

    const createTx = new CreateBitcoinTx(
      {
        changeAddress,
        blockchain: blockchainIdToCode(entry.blockchain),
        entryId: entry.id,
      },
      getUtxo(entry),
    );

    if (isBitcoinFeeRange(feeRange)) {
      createTx.feePrice = feeRange.std;
    }

    return createTx;
  }

  private initEthereumTx(entry: EthereumEntry): CreateEthereumTx {
    const { asset } = this;
    const { getBalance } = this.dataProvider;

    const createTx = new CreateEthereumTx(null, blockchainIdToCode(entry.blockchain));

    createTx.totalBalance = getBalance(entry, asset) as WeiAny;

    return createTx;
  }

  private initErc20Tx(entry: EthereumEntry): CreateErc20Tx {
    const { asset, ownerAddress, tokenRegistry } = this;
    const { getBalance } = this.dataProvider;

    const blockchain = blockchainIdToCode(entry.blockchain);

    const { coinTicker } = Blockchains[blockchain].params;

    const createTx = new CreateErc20Tx(tokenRegistry, asset, blockchain);

    createTx.totalBalance = getBalance(entry, coinTicker) as WeiAny;
    createTx.totalTokenBalance = getBalance(entry, asset, ownerAddress);
    createTx.transferFrom = ownerAddress;

    return createTx;
  }

  private convertEthereumTx(oldCreateTx: EthereumBasicCreateTx): EthereumBasicCreateTx {
    const { asset, entry, feeRange, ownerAddress, tokenRegistry } = this;
    const { getBalance } = this.dataProvider;

    const blockchain = blockchainIdToCode(entry.blockchain);
    const { coinTicker, eip1559: supportEip1559 = false } = Blockchains[blockchain].params;

    const type = supportEip1559 ? oldCreateTx.type : EthereumTransactionType.LEGACY;

    let newCreateTx: EthereumBasicCreateTx;

    if (tokenRegistry.hasAddress(blockchain, asset)) {
      newCreateTx = new CreateErc20Tx(tokenRegistry, asset, blockchain, type);
      newCreateTx.totalBalance = getBalance(entry, coinTicker) as WeiAny;
      newCreateTx.totalTokenBalance = getBalance(entry, asset, newCreateTx.transferFrom);

      newCreateTx.transferFrom = isAnyErc20CreateTx(oldCreateTx)
        ? oldCreateTx.transferFrom ?? ownerAddress
        : ownerAddress;
    } else {
      newCreateTx = new CreateEthereumTx(null, blockchain, type);
      newCreateTx.totalBalance = getBalance(entry, asset) as WeiAny;
    }

    newCreateTx.from = entry.address?.value;
    newCreateTx.to = oldCreateTx.to;

    if (blockchain === oldCreateTx.blockchain && (oldCreateTx.gasPrice?.isPositive() ?? false)) {
      newCreateTx.gasPrice = oldCreateTx.gasPrice;
      newCreateTx.maxGasPrice = oldCreateTx.maxGasPrice;
      newCreateTx.priorityGasPrice = oldCreateTx.priorityGasPrice;
    } else if (isEthereumFeeRange(feeRange)) {
      newCreateTx.gasPrice = feeRange.stdMaxGasPrice;
      newCreateTx.maxGasPrice = feeRange.stdMaxGasPrice;
      newCreateTx.priorityGasPrice = feeRange.stdPriorityGasPrice;
    }

    if (oldCreateTx.target === TxTarget.SEND_ALL) {
      newCreateTx.target = TxTarget.SEND_ALL;

      if (!newCreateTx.rebalance()) {
        newCreateTx.target = TxTarget.MANUAL;

        newCreateTx.amount = isAnyErc20CreateTx(newCreateTx)
          ? tokenRegistry.byAddress(blockchain, newCreateTx.getAsset()).getAmount(0)
          : amountFactory(blockchain)(0);
      }
    }

    return newCreateTx;
  }

  private populateEthereumTx(createTx: AnyEthereumCreateTx | AnyErc20CreateTx, transaction: EthereumPlainTx): void {
    const { asset, entry, feeRange, ownerAddress, tokenRegistry } = this;
    const { getBalance } = this.dataProvider;

    const gasPrice = createTx.gasPrice ?? createTx.maxGasPrice;

    if ((gasPrice?.isZero() ?? true) && isEthereumFeeRange(feeRange)) {
      createTx.gasPrice = feeRange.stdMaxGasPrice;
      createTx.maxGasPrice = feeRange.stdMaxGasPrice;
      createTx.priorityGasPrice = feeRange.stdPriorityGasPrice;
    }

    if (
      transaction.from !== entry.address?.value ||
      transaction.transferFrom !== ownerAddress ||
      (transaction.transferFrom == null && ownerAddress != null)
    ) {
      createTx.from = entry.address?.value;

      const blockchain = blockchainIdToCode(entry.blockchain);
      const { coinTicker } = Blockchains[blockchain].params;

      if (isAnyErc20CreateTx(createTx)) {
        createTx.transferFrom = ownerAddress;

        createTx.totalBalance = getBalance(entry, coinTicker) as WeiAny;
        createTx.totalTokenBalance = getBalance(entry, asset, createTx.transferFrom);
      } else {
        createTx.totalBalance = getBalance(entry, asset) as WeiAny;
      }

      if (createTx.target === TxTarget.SEND_ALL && !createTx.rebalance()) {
        createTx.target = TxTarget.MANUAL;

        createTx.amount = isAnyErc20CreateTx(createTx)
          ? tokenRegistry.byAddress(blockchain, createTx.getAsset()).getAmount(0)
          : amountFactory(blockchain)(0);
      }
    }
  }
}
