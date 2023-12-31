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
  TokenAmount,
  TokenRegistry,
  amountFactory,
  blockchainIdToCode,
  isBitcoin,
  isEthereum,
} from '../../blockchains';
import { EthereumTransactionType } from '../ethereum';
import {
  CreateBitcoinTx,
  CreateErc20ApproveTx,
  CreateErc20ConvertTx,
  CreateErc20RecoveryTx,
  CreateErc20Tx,
  CreateEtherRecoveryTx,
  CreateEtherTx,
} from './create-tx';
import {
  AnyCreateTx,
  AnyErc20CreateTx,
  AnyEtherCreateTx,
  AnyEthereumCreateTx,
  AnyEthereumRecoveryTx,
  fromBitcoinPlainTx,
  fromEthereumPlainTx,
  isAnyErc20CreateTx,
  isErc20ApproveCreateTx,
  isErc20ConvertCreateTx,
  isErc20CreateTx,
  isErc20RecoveryCreateTx,
  isEtherCreateTx,
  isEtherRecoveryCreateTx,
} from './create-tx/types';
import {
  AnyPlainTx,
  EthereumBasicPlainTx,
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
  transaction?: AnyPlainTx;
}

interface DataProvider {
  getBalance(entry: WalletEntry, asset: string, ownerAddress?: string): BigAmount;
  getUtxo(entry: BitcoinEntry): InputUtxo[];
}

type EthereumBasicCreateTx = CreateEtherTx | CreateErc20Tx;

export class TxBuilder implements BuilderOrigin {
  readonly asset: string;
  readonly changeAddress?: string;
  readonly entry: WalletEntry;
  readonly feeRange: FeeRange;
  readonly ownerAddress?: string;
  readonly transaction?: AnyPlainTx;

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

        const { eip1559: supportEip1559 = false } = Blockchains[blockchain].params;

        createTx.type = supportEip1559 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY;
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

        createTx = fromEthereumPlainTx(transaction, tokenRegistry);

        const isChanged = asset !== createTx.getAsset() || blockchain !== createTx.blockchain;

        if (isEtherCreateTx(createTx) || isErc20CreateTx(createTx)) {
          if (isChanged) {
            return this.convertEthereumTx(createTx);
          }

          this.mergeEthereumFee(createTx);
          this.mergeEthereumTx(transaction, createTx);
        }

        if (isErc20ApproveCreateTx(createTx)) {
          if (isChanged) {
            return this.transformErc20ApproveTx(createTx);
          }

          this.mergeEthereumFee(createTx);
        }

        if (isErc20ConvertCreateTx(createTx)) {
          if (isChanged) {
            return this.transformErc20ConvertTx(createTx);
          }

          this.mergeEthereumFee(createTx);
        }

        if (isEtherRecoveryCreateTx(createTx) || isErc20RecoveryCreateTx(createTx)) {
          if (isChanged) {
            return this.convertEthereumRecoveryTx(createTx);
          }

          this.mergeEthereumFee(createTx);
        }
      }
    }

    return createTx;
  }

  private convertEthereumRecoveryTx(oldCreateTx: AnyEthereumRecoveryTx): AnyEthereumRecoveryTx {
    const { asset, entry, feeRange, tokenRegistry } = this;
    const { getBalance } = this.dataProvider;

    const blockchain = blockchainIdToCode(entry.blockchain);

    const { coinTicker, eip1559: supportEip1559 = false } = Blockchains[blockchain].params;

    const type = supportEip1559 ? oldCreateTx.type : EthereumTransactionType.LEGACY;

    let newCreateTx: AnyEthereumRecoveryTx;

    if (tokenRegistry.hasAddress(blockchain, asset)) {
      newCreateTx = new CreateErc20RecoveryTx(asset, tokenRegistry, blockchain, type);
      newCreateTx.totalBalance = getBalance(entry, coinTicker) as WeiAny;
      newCreateTx.totalTokenBalance = getBalance(entry, asset, newCreateTx.transferFrom);
    } else {
      newCreateTx = new CreateEtherRecoveryTx(null, blockchain, type);
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

    newCreateTx.target = TxTarget.SEND_ALL;
    newCreateTx.rebalance();

    return newCreateTx;
  }

  private convertEthereumTx(oldCreateTx: EthereumBasicCreateTx): EthereumBasicCreateTx {
    const { asset, entry, feeRange, ownerAddress, tokenRegistry } = this;
    const { getBalance } = this.dataProvider;

    const blockchain = blockchainIdToCode(entry.blockchain);

    const { coinTicker, eip1559: supportEip1559 = false } = Blockchains[blockchain].params;

    const type = supportEip1559 ? oldCreateTx.type : EthereumTransactionType.LEGACY;

    let newCreateTx: EthereumBasicCreateTx;

    if (tokenRegistry.hasAddress(blockchain, asset)) {
      newCreateTx = new CreateErc20Tx(asset, tokenRegistry, blockchain, type);
      newCreateTx.totalBalance = getBalance(entry, coinTicker) as WeiAny;
      newCreateTx.totalTokenBalance = getBalance(entry, asset, newCreateTx.transferFrom);

      newCreateTx.transferFrom = isAnyErc20CreateTx(oldCreateTx)
        ? oldCreateTx.transferFrom ?? ownerAddress
        : ownerAddress;
    } else {
      newCreateTx = new CreateEtherTx(null, blockchain, type);
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

    if (oldCreateTx.target === TxTarget.MANUAL) {
      newCreateTx.amount = isAnyErc20CreateTx(newCreateTx)
        ? tokenRegistry.byAddress(blockchain, newCreateTx.getAsset()).getAmount(oldCreateTx.amount.number)
        : amountFactory(blockchain)(oldCreateTx.amount.number);
    } else {
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

  private initEthereumTx(entry: EthereumEntry): CreateEtherTx {
    const { asset } = this;
    const { getBalance } = this.dataProvider;

    const createTx = new CreateEtherTx(null, blockchainIdToCode(entry.blockchain));

    createTx.totalBalance = getBalance(entry, asset) as WeiAny;

    return createTx;
  }

  private initErc20Tx(entry: EthereumEntry): CreateErc20Tx {
    const { asset, ownerAddress, tokenRegistry } = this;
    const { getBalance } = this.dataProvider;

    const blockchain = blockchainIdToCode(entry.blockchain);

    const { coinTicker } = Blockchains[blockchain].params;

    const createTx = new CreateErc20Tx(asset, tokenRegistry, blockchain);

    createTx.totalBalance = getBalance(entry, coinTicker) as WeiAny;
    createTx.totalTokenBalance = getBalance(entry, asset, ownerAddress);
    createTx.transferFrom = ownerAddress;

    return createTx;
  }

  private mergeEthereumFee(createTx: AnyEthereumCreateTx): void {
    const { feeRange } = this;

    const gasPrice = createTx.gasPrice ?? createTx.maxGasPrice;

    if ((gasPrice?.isZero() ?? true) && isEthereumFeeRange(feeRange)) {
      createTx.gasPrice = feeRange.stdMaxGasPrice;
      createTx.maxGasPrice = feeRange.stdMaxGasPrice;
      createTx.priorityGasPrice = feeRange.stdPriorityGasPrice;

      createTx.rebalance();
    }
  }

  private mergeEthereumTx(transaction: EthereumBasicPlainTx, createTx: AnyEtherCreateTx | AnyErc20CreateTx): void {
    const { asset, entry, ownerAddress, tokenRegistry } = this;
    const { getBalance } = this.dataProvider;

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

  private transformErc20ApproveTx(createTx: CreateErc20ApproveTx): CreateErc20ApproveTx {
    const { asset, entry, feeRange, tokenRegistry } = this;
    const { getBalance } = this.dataProvider;

    const blockchain = blockchainIdToCode(entry.blockchain);

    if (blockchain !== createTx.blockchain && isEthereumFeeRange(feeRange)) {
      createTx.gasPrice = feeRange.stdMaxGasPrice;
      createTx.maxGasPrice = feeRange.stdMaxGasPrice;
      createTx.priorityGasPrice = feeRange.stdPriorityGasPrice;
    }

    let tokenAddress = asset;

    if (!tokenRegistry.hasAddress(blockchain, tokenAddress)) {
      [{ address: tokenAddress }] = tokenRegistry.byBlockchain(blockchain);
    }

    const { coinTicker, eip1559: supportEip1559 = false } = Blockchains[blockchain].params;

    createTx.setToken(
      tokenRegistry.byAddress(blockchain, tokenAddress),
      getBalance(entry, coinTicker) as WeiAny,
      getBalance(entry, tokenAddress) as TokenAmount,
      supportEip1559,
    );

    return createTx;
  }

  private transformErc20ConvertTx(createTx: CreateErc20ConvertTx): CreateErc20ConvertTx {
    const { asset, entry, feeRange, tokenRegistry } = this;
    const { getBalance } = this.dataProvider;

    const blockchain = blockchainIdToCode(entry.blockchain);

    if (blockchain !== createTx.blockchain && isEthereumFeeRange(feeRange)) {
      createTx.gasPrice = feeRange.stdMaxGasPrice;
      createTx.maxGasPrice = feeRange.stdMaxGasPrice;
      createTx.priorityGasPrice = feeRange.stdPriorityGasPrice;
    }

    createTx.asset = asset;

    let tokenAddress = asset;

    if (!tokenRegistry.hasAddress(blockchain, tokenAddress)) {
      tokenAddress = tokenRegistry.getWrapped(blockchain).address;
    }

    const { coinTicker, eip1559: supportEip1559 = false } = Blockchains[blockchain].params;

    createTx.setToken(
      tokenRegistry.byAddress(blockchain, tokenAddress),
      getBalance(entry, coinTicker) as WeiAny,
      getBalance(entry, tokenAddress) as TokenAmount,
      supportEip1559,
    );

    return createTx;
  }
}
