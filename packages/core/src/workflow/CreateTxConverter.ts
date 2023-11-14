import { BigAmount } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { BitcoinEntry, WalletEntry, isBitcoinEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  Blockchains,
  InputUtxo,
  TokenRegistry,
  amountFactory,
  blockchainIdToCode,
  isBitcoin,
  isEthereum,
} from '../blockchains';
import { EthereumTransactionType } from '../transaction/ethereum';
import { BitcoinTxOrigin, CreateBitcoinTx } from './CreateBitcoinTx';
import { CreateERC20Tx } from './CreateErc20Tx';
import { CreateEthereumTx } from './CreateEthereumTx';
import {
  AnyCreateTx,
  AnyEthereumCreateTx,
  AnyPlainTx,
  BitcoinPlainTx,
  EthereumPlainTx,
  TxTarget,
  isBitcoinPlainTx,
  isErc20CreateTx,
} from './types';

export interface BitcoinFeeRange {
  std: number;
  min: number;
  max: number;
}

export interface EthereumFeeRange<T = WeiAny> {
  stdMaxGasPrice: T;
  lowMaxGasPrice: T;
  highMaxGasPrice: T;
  stdPriorityGasPrice: T;
  lowPriorityGasPrice: T;
  highPriorityGasPrice: T;
}

export type FeeRange = BitcoinFeeRange | EthereumFeeRange;

interface ConverterOrigin {
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

export class CreateTxConverter implements ConverterOrigin {
  readonly asset: string;
  readonly changeAddress?: string;
  readonly entry: WalletEntry;
  readonly feeRange: FeeRange;
  readonly ownerAddress?: string;
  readonly transaction?: BitcoinPlainTx | EthereumPlainTx;

  private readonly dataProvider: DataProvider;
  private readonly tokenRegistry: TokenRegistry;

  constructor(origin: ConverterOrigin, dataProvider: DataProvider, tokenRegistry: TokenRegistry) {
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

  static fromPlainTx(transaction: AnyPlainTx, origin: BitcoinTxOrigin, tokenRegistry: TokenRegistry): AnyCreateTx {
    if (isBitcoinPlainTx(transaction)) {
      return CreateTxConverter.fromBitcoinPlainTx(origin, transaction);
    }

    return CreateTxConverter.fromEthereumPlainTx(transaction, tokenRegistry);
  }

  static fromBitcoinPlainTx(origin: BitcoinTxOrigin, transaction: BitcoinPlainTx): CreateBitcoinTx {
    return CreateBitcoinTx.fromPlain(origin, transaction);
  }

  static fromEthereumPlainTx(transaction: EthereumPlainTx, tokenRegistry: TokenRegistry): AnyEthereumCreateTx {
    if (tokenRegistry.hasAddress(transaction.blockchain, transaction.asset)) {
      return CreateERC20Tx.fromPlain(tokenRegistry, transaction);
    }

    return CreateEthereumTx.fromPlain(transaction);
  }

  static isBitcoinFeeRange(feeRange: unknown): feeRange is BitcoinFeeRange {
    return feeRange != null && typeof feeRange === 'object' && 'std' in feeRange && typeof feeRange.std === 'number';
  }

  static isEthereumFeeRange<T>(feeRange: unknown): feeRange is EthereumFeeRange<T> {
    return (
      feeRange != null &&
      typeof feeRange === 'object' &&
      'stdMaxGasPrice' in feeRange &&
      feeRange.stdMaxGasPrice != null
    );
  }

  get createTx(): AnyCreateTx {
    const { asset, changeAddress, entry, feeRange, ownerAddress, tokenRegistry, transaction } = this;
    const { getBalance, getUtxo } = this.dataProvider;

    const blockchain = blockchainIdToCode(entry.blockchain);
    const { coinTicker, eip1559: supportEip1559 = false } = Blockchains[blockchain].params;

    let createTx: AnyCreateTx;

    if (
      transaction == null ||
      (isBitcoin(blockchain) && isEthereum(transaction.blockchain)) ||
      (isEthereum(blockchain) && isBitcoin(transaction.blockchain))
    ) {
      if (isBitcoinEntry(entry)) {
        createTx = new CreateBitcoinTx({
          blockchain,
          changeAddress,
          entryId: entry.id,
          utxo: getUtxo(entry),
        });

        if (CreateTxConverter.isBitcoinFeeRange(feeRange)) {
          createTx.feePrice = feeRange.std;
        }
      } else {
        if (tokenRegistry.hasAddress(blockchain, asset)) {
          createTx = new CreateERC20Tx(tokenRegistry, asset, blockchain);
          createTx.totalBalance = getBalance(entry, coinTicker) as WeiAny;
          createTx.totalTokenBalance = getBalance(entry, asset, ownerAddress);
          createTx.transferFrom = ownerAddress;
        } else {
          createTx = new CreateEthereumTx(null, blockchain);
          createTx.totalBalance = getBalance(entry, asset) as WeiAny;
        }

        createTx.from = entry.address?.value;

        if (CreateTxConverter.isEthereumFeeRange(feeRange)) {
          createTx.gasPrice = feeRange.stdMaxGasPrice;
          createTx.maxGasPrice = feeRange.stdMaxGasPrice;
          createTx.priorityGasPrice = feeRange.stdPriorityGasPrice;
        }

        createTx.type = supportEip1559 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY;
      }
    } else {
      if (isBitcoinPlainTx(transaction)) {
        if (isEthereumEntry(entry)) {
          throw new Error('Ethereum entry provided for Bitcoin transaction');
        }

        createTx = CreateTxConverter.fromBitcoinPlainTx(
          {
            blockchain,
            changeAddress,
            entryId: entry.id,
            utxo: getUtxo(entry),
          },
          transaction,
        );
      } else {
        if (isBitcoinEntry(entry)) {
          throw new Error('Bitcoin entry provided for Ethereum transaction');
        }

        createTx = CreateTxConverter.fromEthereumPlainTx(transaction, tokenRegistry);

        if (asset !== createTx.getAsset() || blockchain !== createTx.blockchain) {
          const type = supportEip1559 ? createTx.type : EthereumTransactionType.LEGACY;

          let newCreateTx: AnyEthereumCreateTx;

          if (tokenRegistry.hasAddress(blockchain, asset)) {
            newCreateTx = new CreateERC20Tx(tokenRegistry, asset, blockchain, type);
            newCreateTx.totalBalance = getBalance(entry, coinTicker) as WeiAny;
            newCreateTx.totalTokenBalance = getBalance(entry, asset, newCreateTx.transferFrom);

            newCreateTx.transferFrom = isErc20CreateTx(createTx, tokenRegistry)
              ? createTx.transferFrom ?? ownerAddress
              : ownerAddress;
          } else {
            newCreateTx = new CreateEthereumTx(null, blockchain, type);
            newCreateTx.totalBalance = getBalance(entry, asset) as WeiAny;
          }

          newCreateTx.from = entry.address?.value;
          newCreateTx.to = createTx.to;

          if (blockchain === createTx.blockchain && (createTx.gasPrice?.isPositive() ?? false)) {
            newCreateTx.gasPrice = createTx.gasPrice;
            newCreateTx.maxGasPrice = createTx.maxGasPrice;
            newCreateTx.priorityGasPrice = createTx.priorityGasPrice;
          } else if (CreateTxConverter.isEthereumFeeRange(feeRange)) {
            newCreateTx.gasPrice = feeRange.stdMaxGasPrice;
            newCreateTx.maxGasPrice = feeRange.stdMaxGasPrice;
            newCreateTx.priorityGasPrice = feeRange.stdPriorityGasPrice;
          }

          if (createTx.target === TxTarget.SEND_ALL) {
            newCreateTx.target = TxTarget.SEND_ALL;

            if (!newCreateTx.rebalance()) {
              newCreateTx.target = TxTarget.MANUAL;

              newCreateTx.amount = isErc20CreateTx(newCreateTx, tokenRegistry)
                ? tokenRegistry.byAddress(blockchain, newCreateTx.getAsset()).getAmount(0)
                : amountFactory(blockchain)(0);
            }
          }

          return newCreateTx;
        }

        const gasPrice = createTx.gasPrice ?? createTx.maxGasPrice;

        if ((gasPrice?.isZero() ?? true) && CreateTxConverter.isEthereumFeeRange(feeRange)) {
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

          if (isErc20CreateTx(createTx, tokenRegistry)) {
            createTx.transferFrom = ownerAddress;

            createTx.totalBalance = getBalance(entry, coinTicker) as WeiAny;
            createTx.totalTokenBalance = getBalance(entry, asset, createTx.transferFrom);
          } else {
            createTx.totalBalance = getBalance(entry, asset) as WeiAny;
          }

          if (createTx.target === TxTarget.SEND_ALL && !createTx.rebalance()) {
            createTx.target = TxTarget.MANUAL;

            createTx.amount = isErc20CreateTx(createTx, tokenRegistry)
              ? tokenRegistry.byAddress(blockchain, createTx.getAsset()).getAmount(0)
              : amountFactory(blockchain)(0);
          }
        }
      }
    }

    return createTx;
  }
}
