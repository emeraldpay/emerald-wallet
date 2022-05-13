import { Wei } from '@emeraldpay/bigamount-crypto';
import { BigNumber } from 'bignumber.js';
import { DisplayEtherTx, IDisplayTx } from '..';
import { targetFromNumber, Tx, TxDetailsPlain, TxTarget, ValidationResult } from './types';

export interface TxDetails {
  amount: Wei;
  from?: string;
  gas: BigNumber;
  gasPrice?: Wei;
  maxGasPrice?: Wei;
  priorityGasPrice?: Wei;
  target: TxTarget;
  to?: string;
  totalBalance?: Wei;
}

const TxDefaults: TxDetails = {
  amount: Wei.ZERO,
  gas: new BigNumber(21000),
  target: TxTarget.MANUAL,
};

function fromPlainDetails(plain: TxDetailsPlain): TxDetails {
  return {
    amount: Wei.decode(plain.amount),
    from: plain.from,
    gas: new BigNumber(plain.gas),
    gasPrice: plain.gasPrice == null ? undefined : Wei.decode(plain.gasPrice),
    maxGasPrice: plain.maxGasPrice == null ? undefined : Wei.decode(plain.maxGasPrice),
    priorityGasPrice: plain.priorityGasPrice == null ? undefined : Wei.decode(plain.priorityGasPrice),
    target: targetFromNumber(plain.target),
    to: plain.to,
    totalBalance: plain.totalEtherBalance == null ? undefined : Wei.decode(plain.totalEtherBalance),
  };
}

function toPlainDetails(tx: TxDetails): TxDetailsPlain {
  return {
    amount: tx.amount.encode(),
    amountDecimals: 18,
    from: tx.from,
    gas: tx.gas.toNumber(),
    gasPrice: tx.gasPrice?.encode(),
    maxGasPrice: tx.maxGasPrice?.encode(),
    priorityGasPrice: tx.priorityGasPrice?.encode(),
    target: tx.target.valueOf(),
    to: tx.to,
    tokenSymbol: 'ETH',
    totalEtherBalance: tx.totalBalance?.encode(),
  };
}

export class CreateEthereumTx implements TxDetails, Tx<Wei> {
  public amount: Wei;
  public from?: string;
  public gas: BigNumber;
  public gasPrice?: Wei;
  public maxGasPrice?: Wei;
  public priorityGasPrice?: Wei;
  public target: TxTarget;
  public to?: string;
  public totalBalance?: Wei;

  constructor(source?: TxDetails | null, eip1559 = false) {
    let details = source;

    if (details == null) {
      details = TxDefaults;
    }

    this.amount = details.amount;
    this.from = details.from;
    this.gas = details.gas;
    this.target = details.target;
    this.to = details.to;
    this.totalBalance = details.totalBalance;

    if (eip1559 || details.maxGasPrice != null) {
      this.maxGasPrice = details.maxGasPrice ?? Wei.ZERO;
      this.priorityGasPrice = details.priorityGasPrice ?? Wei.ZERO;
    } else {
      this.gasPrice = details.gasPrice ?? Wei.ZERO;
    }
  }

  public static fromPlain(details: TxDetailsPlain): CreateEthereumTx {
    return new CreateEthereumTx(fromPlainDetails(details));
  }

  public getAmount(): Wei {
    return this.amount;
  }

  public setAmount(amount: Wei): void {
    this.amount = amount;
  }

  public getChange(): Wei | null {
    if (this.totalBalance == null) {
      return null;
    }

    return this.totalBalance.minus(this.getTotal());
  }

  public getFees(): Wei {
    const gasPrice = this.maxGasPrice ?? this.gasPrice ?? Wei.ZERO;

    return gasPrice.multiply(this.gas);
  }

  public getTokenSymbol(): string {
    return 'ETH';
  }

  public getTotal(): Wei {
    return this.amount.plus(this.getFees());
  }

  public getTotalBalance(): Wei {
    return this.totalBalance ?? Wei.ZERO;
  }

  public setTotalBalance(total: Wei): void {
    this.totalBalance = total;
  }

  public setFrom(from: string | null, balance: Wei): void {
    if (from !== null) {
      this.from = from;
    }

    this.totalBalance = balance;
  }

  public display(): IDisplayTx {
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
    const gasPrice = this.maxGasPrice ?? this.gasPrice ?? Wei.ZERO;

    return (
      `Send ${this.from} -> ${this.to} of ${this.amount.toString()} ` +
      `using ${this.gas} at ${gasPrice.toString()}.\n` +
      `Total to send: ${this.getTotal()} (${this.getFees()} are fees), ` +
      `account has ${this.totalBalance ?? 0} (${this.totalBalance?.toString() ?? 0} Wei), ` +
      `will have ${change ?? 0} (${change?.toString() ?? 0} Wei)`
    );
  }
}
