import { BigAmount } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import BigNumber from 'bignumber.js';
import { BlockchainCode, Token, TokenRegistry, amountDecoder, amountFactory, tokenAbi } from '../../../blockchains';
import { Contract } from '../../../Contract';
import { DEFAULT_GAS_LIMIT_ERC20, EthereumTransaction, EthereumTransactionType } from '../../ethereum';
import { CommonTx, EthereumPlainTx, TxMetaType, TxTarget, ValidationResult } from '../types';
import { EthereumTx } from './types';

export interface Erc20TxDetails extends CommonTx {
  amount: BigAmount;
  asset: string;
  blockchain: BlockchainCode;
  from?: string;
  gas: number;
  gasPrice?: WeiAny;
  maxGasPrice?: WeiAny;
  priorityGasPrice?: WeiAny;
  target: TxTarget;
  to?: string;
  totalBalance?: WeiAny;
  totalTokenBalance?: BigAmount;
  transferFrom?: string;
  type: EthereumTransactionType;
}

const TxDefaults: Omit<Erc20TxDetails, 'amount' | 'asset' | 'blockchain' | 'type'> = {
  from: undefined,
  gas: DEFAULT_GAS_LIMIT_ERC20,
  meta: { type: TxMetaType.ETHEREUM_TRANSFER },
  target: TxTarget.MANUAL,
  to: undefined,
};

export function fromPlainDetails(tokenRegistry: TokenRegistry, plain: EthereumPlainTx): Erc20TxDetails {
  const units = tokenRegistry.byAddress(plain.blockchain, plain.asset).getUnits();

  const decoder: (value: string) => WeiAny = amountDecoder(plain.blockchain);

  return {
    amount: BigAmount.decode(plain.amount, units),
    asset: plain.asset,
    blockchain: plain.blockchain,
    from: plain.from,
    gas: plain.gas,
    gasPrice: plain.gasPrice == null ? undefined : decoder(plain.gasPrice),
    maxGasPrice: plain.maxGasPrice == null ? undefined : decoder(plain.maxGasPrice),
    meta: plain.meta,
    priorityGasPrice: plain.priorityGasPrice == null ? undefined : decoder(plain.priorityGasPrice),
    target: plain.target,
    to: plain.to,
    totalBalance: plain.totalBalance == null ? undefined : decoder(plain.totalBalance),
    totalTokenBalance: plain.totalTokenBalance == null ? undefined : BigAmount.decode(plain.totalTokenBalance, units),
    transferFrom: plain.transferFrom,
    type: parseInt(plain.type, 16) === 2 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY,
  };
}

function toPlainDetails(tx: Erc20TxDetails): EthereumPlainTx {
  return {
    amount: tx.amount.encode(),
    asset: tx.asset,
    blockchain: tx.blockchain,
    from: tx.from,
    gas: tx.gas,
    gasPrice: tx.gasPrice?.encode(),
    maxGasPrice: tx.maxGasPrice?.encode(),
    meta: tx.meta,
    priorityGasPrice: tx.priorityGasPrice?.encode(),
    target: tx.target.valueOf(),
    to: tx.to,
    totalBalance: tx.totalBalance?.encode(),
    totalTokenBalance: tx.totalTokenBalance?.encode(),
    transferFrom: tx.transferFrom,
    type: `0x${tx.type.toString(16)}`,
  };
}

export class CreateErc20Tx implements Erc20TxDetails, EthereumTx<BigAmount> {
  meta = { type: TxMetaType.ERC20_TRANSFER };

  public amount: BigAmount;
  public blockchain: BlockchainCode;
  public asset: string;
  public from?: string;
  public gas: number;
  public gasPrice?: WeiAny;
  public maxGasPrice?: WeiAny;
  public priorityGasPrice?: WeiAny;
  public target: TxTarget;
  public to?: string;
  public totalBalance?: WeiAny;
  public totalTokenBalance?: BigAmount;
  public transferFrom?: string;
  public type: EthereumTransactionType;

  private readonly token: Token;
  private readonly tokenRegistry: TokenRegistry;
  private readonly zeroAmount: WeiAny;
  private readonly zeroTokenAmount: BigAmount;

  private tokenContract = new Contract(tokenAbi);

  constructor(
    tokenRegistry: TokenRegistry,
    source: Erc20TxDetails | string,
    blockchain?: BlockchainCode | null,
    type = EthereumTransactionType.EIP1559,
  ) {
    let details: Erc20TxDetails;

    if (typeof source === 'string') {
      const blockchainCode = blockchain ?? BlockchainCode.Unknown;

      this.token = tokenRegistry.byAddress(blockchainCode, source);

      details = {
        ...TxDefaults,
        type,
        amount: this.token.getAmount(0),
        asset: source,
        blockchain: blockchainCode,
      };
    } else {
      this.token = tokenRegistry.byAddress(source.blockchain, source.asset);

      details = source;
    }

    this.amount = details.amount;
    this.asset = details.asset;
    this.blockchain = details.blockchain;
    this.from = details.from;
    this.gas = details.gas;
    this.target = details.target;
    this.to = details.to;
    this.totalBalance = details.totalBalance;
    this.totalTokenBalance = details.totalTokenBalance;
    this.transferFrom = details.transferFrom;
    this.type = details.type;

    const zeroAmount = amountFactory(details.blockchain)(0) as WeiAny;

    this.gasPrice = details.gasPrice ?? zeroAmount;
    this.maxGasPrice = details.maxGasPrice ?? zeroAmount;
    this.priorityGasPrice = details.priorityGasPrice ?? zeroAmount;

    this.tokenRegistry = tokenRegistry;

    this.zeroAmount = zeroAmount;
    this.zeroTokenAmount = tokenRegistry.byAddress(this.blockchain, this.asset).getAmount(0);
  }

  public static fromPlain(tokenRegistry: TokenRegistry, details: EthereumPlainTx): CreateErc20Tx {
    return new CreateErc20Tx(tokenRegistry, fromPlainDetails(tokenRegistry, details));
  }

  public getAmount(): BigAmount {
    return this.amount;
  }

  public getAsset(): string {
    return this.asset;
  }

  public setAmount(amount: BigAmount | BigNumber): void {
    if (BigAmount.is(amount)) {
      this.amount = amount;
    } else {
      const { units } = this.amount;

      this.amount = new BigAmount(1, units).multiply(units.top.multiplier).multiply(amount);
    }
  }

  public getChange(): BigAmount | null {
    if (this.totalTokenBalance == null) {
      return null;
    }

    return this.totalTokenBalance.minus(this.getTotal());
  }

  public getFees(): WeiAny {
    const gasPrice =
      (this.type === EthereumTransactionType.EIP1559 ? this.maxGasPrice : this.gasPrice) ?? this.zeroAmount;

    return gasPrice.multiply(this.gas);
  }

  public getFeesChange(): WeiAny | null {
    if (this.totalBalance == null) {
      return null;
    }

    return this.totalBalance.minus(this.getFees());
  }

  public getTotal(): BigAmount {
    return this.amount;
  }

  public getTotalBalance(): BigAmount {
    return this.totalTokenBalance ? this.totalTokenBalance : this.zeroTokenAmount;
  }

  public setFrom(from: string, balance: WeiAny, tokenBalance: BigAmount): void {
    this.from = from;
    this.totalBalance = balance;
    this.totalTokenBalance = tokenBalance;
  }

  public setTotalBalance(total: BigAmount): void {
    this.totalTokenBalance = total;
  }

  public build(): EthereumTransaction {
    const { blockchain, gas, gasPrice, maxGasPrice, priorityGasPrice, to, type, from = '' } = this;

    const value = this.amount.number.toFixed();

    const data =
      this.transferFrom == null
        ? this.tokenContract.functionToData('transfer', { _to: to, _value: value })
        : this.tokenContract.functionToData('transferFrom', { _from: this.transferFrom, _to: to, _value: value });

    return {
      blockchain,
      data,
      from,
      gas,
      gasPrice,
      maxGasPrice,
      priorityGasPrice,
      type,
      to: this.token.address,
      value: this.zeroAmount,
    };
  }

  public dump(): EthereumPlainTx {
    return toPlainDetails(this);
  }

  public validate(): ValidationResult {
    if (this.amount.isZero()) {
      return ValidationResult.NO_AMOUNT;
    }

    if (this.from == null || this.totalTokenBalance == null || this.totalBalance == null) {
      return ValidationResult.NO_FROM;
    }

    if (this.to == null) {
      return ValidationResult.NO_TO;
    }

    if (this.totalTokenBalance && this.getTotal().isGreaterThan(this.totalTokenBalance)) {
      return ValidationResult.INSUFFICIENT_TOKEN_FUNDS;
    }

    if (this.getFees().isGreaterThan(this.totalBalance)) {
      return ValidationResult.INSUFFICIENT_FUNDS;
    }

    return ValidationResult.OK;
  }

  public rebalance(): boolean {
    if (this.target === TxTarget.SEND_ALL) {
      if (this.totalTokenBalance == null) {
        return false;
      }

      this.amount = this.totalTokenBalance;

      return true;
    }

    return true;
  }

  public debug(): string {
    const change = this.getChange();

    const gasPrice =
      (this.type === EthereumTransactionType.EIP1559 ? this.maxGasPrice : this.gasPrice) ?? this.zeroAmount;

    return (
      `Send ${this.from} -> ${this.to} of ${JSON.stringify(this.amount)} ` +
      `using ${this.gas} at ${gasPrice.toString()}.\n` +
      `Total to send: ${this.getTotal()} of token, pay ${this.getFees()} of Ether fees,` +
      `account has ${this.totalTokenBalance ?? 0}, will have ${change ?? 0}`
    );
  }
}
