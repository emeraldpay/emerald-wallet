import { BigAmount } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import { Blockchains, TokenRegistry, amountFactory, blockchainIdToCode } from '../../blockchains';
import { EthereumTransactionType } from '../../transaction/ethereum';
import { CreateERC20Tx } from './CreateErc20Tx';
import { CreateEthereumTx } from './CreateEthereumTx';
import { TxDetailsPlain, TxTarget } from './types';

export type CreateTx = CreateEthereumTx | CreateERC20Tx;

export interface FeeRange<T = WeiAny> {
  stdMaxGasPrice: T;
  lowMaxGasPrice: T;
  highMaxGasPrice: T;
  stdPriorityGasPrice: T;
  lowPriorityGasPrice: T;
  highPriorityGasPrice: T;
}

type GetBalance = (entry: EthereumEntry, asset: string, ownerAddress?: string) => BigAmount;

interface TxOrigin {
  asset: string;
  entry: EthereumEntry;
  feeRange: FeeRange;
  ownerAddress?: string;
  transaction?: TxDetailsPlain;
}

export class CreateTxConverter {
  private asset: string;
  private entry: EthereumEntry;
  private feeRange: FeeRange;
  private ownerAddress?: string;
  private transaction?: TxDetailsPlain;

  private readonly tokenRegistry: TokenRegistry;

  private readonly getBalance: GetBalance;

  constructor(
    { asset, entry, feeRange, ownerAddress, transaction }: TxOrigin,
    tokenRegistry: TokenRegistry,
    getBalance: GetBalance,
  ) {
    this.asset = asset;
    this.entry = entry;
    this.feeRange = feeRange;
    this.ownerAddress = ownerAddress;
    this.transaction = transaction;

    this.tokenRegistry = tokenRegistry;

    this.getBalance = getBalance;
  }

  static fromPlain(transaction: TxDetailsPlain, tokenRegistry: TokenRegistry): CreateTx {
    if (tokenRegistry.hasAddress(transaction.blockchain, transaction.asset)) {
      return CreateERC20Tx.fromPlain(tokenRegistry, transaction);
    }

    return CreateEthereumTx.fromPlain(transaction);
  }

  static isErc20CreateTx(createTx: CreateTx, tokenRegistry: TokenRegistry): createTx is CreateERC20Tx {
    return tokenRegistry.hasAddress(createTx.blockchain, createTx.getAsset());
  }

  get createTx(): CreateTx {
    const { asset, entry, feeRange, ownerAddress, tokenRegistry, transaction } = this;

    const blockchain = blockchainIdToCode(entry.blockchain);
    const { coinTicker, eip1559: supportEip1559 = false } = Blockchains[blockchain].params;

    let createTx: CreateTx;

    if (transaction == null) {
      if (tokenRegistry.hasAddress(blockchain, asset)) {
        createTx = new CreateERC20Tx(tokenRegistry, asset, blockchain);
        createTx.totalBalance = this.getBalance(entry, coinTicker) as WeiAny;
        createTx.totalTokenBalance = this.getBalance(entry, asset, ownerAddress);
        createTx.transferFrom = ownerAddress;
      } else {
        createTx = new CreateEthereumTx(null, blockchain);
        createTx.totalBalance = this.getBalance(entry, asset) as WeiAny;
      }

      createTx.from = entry.address?.value;

      createTx.gasPrice = feeRange.stdMaxGasPrice;
      createTx.maxGasPrice = feeRange.stdMaxGasPrice;
      createTx.priorityGasPrice = feeRange.stdPriorityGasPrice;

      createTx.type = supportEip1559 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY;
    } else {
      createTx = CreateTxConverter.fromPlain(transaction, tokenRegistry);

      if (asset !== createTx.getAsset() || blockchain !== createTx.blockchain) {
        const type = supportEip1559 ? createTx.type : EthereumTransactionType.LEGACY;

        let newCreateTx: CreateTx;

        if (tokenRegistry.hasAddress(blockchain, asset)) {
          newCreateTx = new CreateERC20Tx(tokenRegistry, asset, blockchain, type);
          newCreateTx.totalBalance = this.getBalance(entry, coinTicker) as WeiAny;
          newCreateTx.totalTokenBalance = this.getBalance(entry, asset, newCreateTx.transferFrom);

          newCreateTx.transferFrom = CreateTxConverter.isErc20CreateTx(createTx, tokenRegistry)
            ? createTx.transferFrom ?? ownerAddress
            : ownerAddress;
        } else {
          newCreateTx = new CreateEthereumTx(null, blockchain, type);
          newCreateTx.totalBalance = this.getBalance(entry, asset) as WeiAny;
        }

        newCreateTx.from = entry.address?.value;
        newCreateTx.to = createTx.to;

        if (blockchain === createTx.blockchain) {
          newCreateTx.gasPrice = createTx.gasPrice;
          newCreateTx.maxGasPrice = createTx.maxGasPrice;
          newCreateTx.priorityGasPrice = createTx.priorityGasPrice;
        } else {
          newCreateTx.gasPrice = feeRange.stdMaxGasPrice;
          newCreateTx.maxGasPrice = feeRange.stdMaxGasPrice;
          newCreateTx.priorityGasPrice = feeRange.stdPriorityGasPrice;
        }

        if (createTx.target === TxTarget.SEND_ALL) {
          newCreateTx.target = TxTarget.SEND_ALL;

          if (!newCreateTx.rebalance()) {
            newCreateTx.target = TxTarget.MANUAL;

            newCreateTx.amount = CreateTxConverter.isErc20CreateTx(newCreateTx, tokenRegistry)
              ? tokenRegistry.byAddress(blockchain, newCreateTx.getAsset()).getAmount(0)
              : amountFactory(blockchain)(0);
          }
        }

        return newCreateTx;
      }

      const gasPrice = createTx.gasPrice ?? createTx.maxGasPrice;

      if (gasPrice?.isZero() ?? true) {
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

        if (CreateTxConverter.isErc20CreateTx(createTx, tokenRegistry)) {
          createTx.transferFrom = ownerAddress;

          createTx.totalBalance = this.getBalance(entry, coinTicker) as WeiAny;
          createTx.totalTokenBalance = this.getBalance(entry, asset, createTx.transferFrom);
        } else {
          createTx.totalBalance = this.getBalance(entry, asset) as WeiAny;
        }
      }
    }

    return createTx;
  }
}
