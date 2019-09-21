import BigNumber from 'bignumber.js';
import { Units, Wei } from '@emeraldplatform/eth';
import { DisplayEtherTx, IDisplayTx } from '..';
import { targetFromNumber, TxTarget, ValidationResult } from './types';

export interface ITxDetails {
  from?: string;
  to?: string;
  target: TxTarget;
  amount: Wei;
  totalBalance?: Wei;
  gasPrice: Wei;
  gas: BigNumber;
}

export interface TxDetailsPlain {
  from?: string;
  to?: string;
  target: number;
  amount: string;
  totalBalance?: string;
  gasPrice: string;
  gas: number;
}

const TxDefaults: ITxDetails = {
  amount: Wei.ZERO,
  gas: new BigNumber(21000),
  gasPrice: Wei.ZERO,
  target: TxTarget.MANUAL
};

function toPlainDetails (tx: ITxDetails): TxDetailsPlain {
  return {
    amount: tx.amount.toString(Units.WEI, 0, false),
    from: tx.from,
    gas: tx.gas.toNumber(),
    gasPrice: tx.gasPrice.toString(Units.WEI, 0, false),
    target: tx.target.valueOf(),
    to: tx.to,
    totalBalance: tx.totalBalance == null ? undefined : tx.totalBalance.toString(Units.WEI, 0, false)
  };
}

function fromPlainDetails (plain: TxDetailsPlain): ITxDetails {
  return {
    amount: new Wei(plain.amount, Units.WEI),
    from: plain.from,
    gas: new BigNumber(plain.gas),
    gasPrice: new Wei(plain.gasPrice, Units.WEI),
    target: targetFromNumber(plain.target),
    to: plain.to,
    totalBalance: plain.totalBalance == null ? undefined : new Wei(plain.totalBalance, Units.WEI)
  };
}

export class CreateEthereumTx implements ITxDetails {

  public static fromPlain (details: TxDetailsPlain): CreateEthereumTx {
    return new CreateEthereumTx(fromPlainDetails(details));
  }
  public from?: string;
  public to?: string;
  public target: TxTarget;
  public amount: Wei;
  public totalBalance?: Wei;
  public gasPrice: Wei;
  public gas: BigNumber;

  constructor (details?: ITxDetails) {
    if (!details) {
      details = TxDefaults;
    }
    this.from = details.from;
    this.to = details.to;
    this.target = details.target;
    this.amount = details.amount;
    this.totalBalance = details.totalBalance;
    this.gasPrice = details.gasPrice;
    this.gas = details.gas;
  }

  public dump (): TxDetailsPlain {
    return toPlainDetails(this);
  }

  public display (): IDisplayTx {
    return new DisplayEtherTx(this);
  }

  public setFrom (from: string | null, balance: Wei) {
    if (from !== null) {
      this.from = from;
    }
    this.totalBalance = balance;
  }

  public validate (): ValidationResult {
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

  public validateTarget (): boolean {
    if (this.target === TxTarget.SEND_ALL) {
      if (this.totalBalance == null) {
        return false;
      }
      return this.getTotal().equals(this.totalBalance);
    }
    return true;
  }

  public getTotal (): Wei {
    return this.amount.plus(this.getFees());
  }

  public getChange (): (Wei | null) {
    if (this.totalBalance == null) {
      return null;
    }
    return this.totalBalance.minus(this.getTotal());
  }

  public getFees (): Wei {
    return new Wei(this.gas.multipliedBy(this.gasPrice.value));
  }

  public rebalance (): boolean {
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

  public debug (): string {
    const change = this.getChange();
    return `Send ${this.from} -> ${this.to} of ${this.amount.toEther()} using ${this.gas} at ${this.gasPrice.toString(Units.MWEI, undefined, true)}.\n` +
           `Total to send: ${this.getTotal()} (${this.getFees()} are fees),` +
              `account has ${this.totalBalance} (${this.totalBalance == null ? null : this.totalBalance.toString(Units.WEI)} Wei), ` +
              `will have ${change} (${change == null ? null : change.toString(Units.WEI)} Wei)`;

  }

}
