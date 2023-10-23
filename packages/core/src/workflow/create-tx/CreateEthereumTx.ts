import { BigAmount } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import BigNumber from 'bignumber.js';
import { DisplayEtherTx, DisplayTx } from '..';
import { BlockchainCode, amountDecoder, amountFactory } from '../../blockchains';
import { DEFAULT_GAS_LIMIT, EthereumTransaction, EthereumTransactionType } from '../../transaction/ethereum';
import { Tx, TxDetailsPlain, TxTarget, ValidationResult, targetFromNumber } from './types';

export interface TxDetails {
  amount: WeiAny;
  blockchain: BlockchainCode;
  from?: string;
  gas: number;
  gasPrice?: WeiAny;
  maxGasPrice?: WeiAny;
  priorityGasPrice?: WeiAny;
  target: TxTarget;
  to?: string;
  totalBalance?: WeiAny;
  type: EthereumTransactionType;
}

const TxDefaults: Omit<TxDetails, 'amount' | 'blockchain' | 'type'> = {
  gas: DEFAULT_GAS_LIMIT,
  target: TxTarget.MANUAL,
};

function fromPlainDetails(plain: TxDetailsPlain): TxDetails {
  const decoder: (value: string) => WeiAny = amountDecoder(plain.blockchain);

  return {
    amount: decoder(plain.amount),
    blockchain: plain.blockchain,
    from: plain.from,
    gas: plain.gas,
    gasPrice: plain.gasPrice == null ? undefined : (decoder(plain.gasPrice) as WeiAny),
    maxGasPrice: plain.maxGasPrice == null ? undefined : decoder(plain.maxGasPrice),
    priorityGasPrice: plain.priorityGasPrice == null ? undefined : decoder(plain.priorityGasPrice),
    target: targetFromNumber(plain.target),
    to: plain.to,
    totalBalance: plain.totalEtherBalance == null ? undefined : decoder(plain.totalEtherBalance),
    type: parseInt(plain.type, 16) === 2 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY,
  };
}

function toPlainDetails(tx: TxDetails): TxDetailsPlain {
  return {
    amount: tx.amount.encode(),
    amountDecimals: 18,
    asset: tx.amount.units.top.code,
    blockchain: tx.blockchain,
    from: tx.from,
    gas: tx.gas,
    gasPrice: tx.gasPrice?.encode(),
    maxGasPrice: tx.maxGasPrice?.encode(),
    priorityGasPrice: tx.priorityGasPrice?.encode(),
    target: tx.target.valueOf(),
    to: tx.to,
    totalEtherBalance: tx.totalBalance?.encode(),
    type: `0x${tx.type.toString(16)}`,
  };
}

export class CreateEthereumTx implements TxDetails, Tx<BigAmount> {
  public amount: WeiAny;
  public blockchain: BlockchainCode;
  public from?: string;
  public gas: number;
  public gasPrice?: WeiAny;
  public maxGasPrice?: WeiAny;
  public priorityGasPrice?: WeiAny;
  public target: TxTarget;
  public to?: string;
  public totalBalance?: WeiAny;
  public type: EthereumTransactionType;

  private readonly zeroAmount: WeiAny;

  constructor(source?: TxDetails | null, blockchain?: BlockchainCode | null, type = EthereumTransactionType.EIP1559) {
    let details = source;

    const blockchainCode = source?.blockchain ?? blockchain ?? BlockchainCode.Unknown;
    const zeroAmount = amountFactory(blockchainCode)(0) as WeiAny;

    if (details == null) {
      details = {
        ...TxDefaults,
        type,
        amount: zeroAmount,
        blockchain: blockchainCode,
      };
    }

    this.amount = details.amount;
    this.blockchain = blockchainCode;
    this.from = details.from;
    this.gas = details.gas;
    this.target = details.target;
    this.to = details.to;
    this.totalBalance = details.totalBalance;
    this.type = details.type;

    this.gasPrice = details.gasPrice ?? zeroAmount;
    this.maxGasPrice = details.maxGasPrice ?? zeroAmount;
    this.priorityGasPrice = details.priorityGasPrice ?? zeroAmount;

    this.zeroAmount = zeroAmount;
  }

  public static fromPlain(details: TxDetailsPlain): CreateEthereumTx {
    return new CreateEthereumTx(fromPlainDetails(details));
  }

  public getAmount(): WeiAny {
    return this.amount;
  }

  public setAmount(amount: WeiAny | BigNumber): void {
    if (WeiAny.is(amount)) {
      this.amount = amount;
    } else {
      const { units } = this.amount;

      this.amount = new WeiAny(1, units).multiply(units.top.multiplier).multiply(amount);
    }
  }

  public getAsset(): string {
    return this.amount.units.top.code;
  }

  public getChange(): WeiAny | null {
    if (this.totalBalance == null) {
      return null;
    }

    return this.totalBalance.minus(this.getTotal());
  }

  public getFees(): WeiAny {
    const gasPrice =
      (this.type === EthereumTransactionType.EIP1559 ? this.maxGasPrice : this.gasPrice) ?? this.zeroAmount;

    return gasPrice.multiply(this.gas);
  }

  public getTotal(): WeiAny {
    return this.amount.plus(this.getFees());
  }

  public getTotalBalance(): WeiAny {
    return this.totalBalance ?? this.zeroAmount;
  }

  public setTotalBalance(total: WeiAny): void {
    this.totalBalance = total;
  }

  public setFrom(from: string | null, balance: WeiAny): void {
    if (from !== null) {
      this.from = from;
    }

    this.totalBalance = balance;
  }

  public build(): EthereumTransaction {
    const { blockchain, gas, gasPrice, maxGasPrice, priorityGasPrice, to, type, amount: value, from = '' } = this;

    return { blockchain, from, gas, gasPrice, maxGasPrice, priorityGasPrice, to, type, value };
  }

  public display(): DisplayTx {
    return new DisplayEtherTx(this);
  }

  public dump(): TxDetailsPlain {
    return toPlainDetails(this);
  }

  public validate(): ValidationResult {
    if (this.from == null || this.totalBalance == null) {
      return ValidationResult.NO_FROM;
    }

    if (this.to == null) {
      return ValidationResult.NO_TO;
    }

    if (this.getTotal().isGreaterThan(this.totalBalance)) {
      return ValidationResult.INSUFFICIENT_FUNDS;
    }

    return ValidationResult.OK;
  }

  public validateTarget(): boolean {
    if (this.target === TxTarget.SEND_ALL) {
      if (this.totalBalance == null) {
        return false;
      }

      return this.getTotal().equals(this.totalBalance);
    }

    return true;
  }

  public rebalance(): boolean {
    if (this.target === TxTarget.SEND_ALL) {
      if (this.totalBalance == null) {
        return false;
      }

      const amount = this.totalBalance.minus(this.getFees());

      if (amount.isPositive() || amount.isZero()) {
        this.amount = amount;

        return true;
      }

      return false;
    }

    return true;
  }

  public debug(): string {
    const change = this.getChange();

    const gasPrice =
      (this.type === EthereumTransactionType.EIP1559 ? this.maxGasPrice : this.gasPrice) ?? this.zeroAmount;

    return (
      `Send ${this.from} -> ${this.to} of ${this.amount.toString()} ` +
      `using ${this.gas} at ${gasPrice.toString()}.\n` +
      `Total to send: ${this.getTotal()} (${this.getFees()} are fees), ` +
      `account has ${this.totalBalance ?? 0}, will have ${change ?? 0}`
    );
  }
}
