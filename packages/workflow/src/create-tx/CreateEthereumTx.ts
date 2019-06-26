import { Wei, Units } from "@emeraldplatform/eth";
import { TxTarget, ValidationResult, targetFromNumber } from './types';
import BigNumber from 'bignumber.js';

export type TxDetails = {
  from?: string;
  to?: string;
  target: TxTarget;
  amount: Wei;
  totalBalance?: Wei;
  gasPrice: Wei;
  gas: BigNumber;
}

export type TxDetailsPlain = {
  from?: string;
  to?: string;
  target: number;
  amount: string;
  totalBalance?: string;
  gasPrice: string;
  gas: number;
}

const TxDefaults: TxDetails = {
  target: TxTarget.MANUAL,
  amount: Wei.ZERO,
  gasPrice: Wei.ZERO,
  gas: new BigNumber(21000)
};

function toPlainDetails(tx: TxDetails): TxDetailsPlain {
  return {
    from: tx.from,
    to: tx.to,
    target: tx.target.valueOf(),
    amount: tx.amount.toString(Units.WEI, 0, false),
    totalBalance: tx.totalBalance == null ? undefined : tx.totalBalance.toString(Units.WEI, 0, false),
    gasPrice: tx.gasPrice.toString(Units.WEI, 0, false),
    gas: tx.gas.toNumber()
  }
}

function fromPlainDetails(plain: TxDetailsPlain): TxDetails {
  return {
    from: plain.from,
    to: plain.to,
    target: targetFromNumber(plain.target),
    amount: new Wei(plain.amount, Units.WEI),
    totalBalance: plain.totalBalance == null ? undefined : new Wei(plain.totalBalance, Units.WEI),
    gasPrice: new Wei(plain.gasPrice, Units.WEI),
    gas: new BigNumber(plain.gas)
  }
}

export class CreateEthereumTx implements TxDetails {
  from?: string;
  to?: string;
  target: TxTarget;
  amount: Wei;
  totalBalance?: Wei;
  gasPrice: Wei;
  gas: BigNumber;

  constructor(details?: TxDetails) {
    if (!details) {
      details = TxDefaults
    }
    this.from = details.from;
    this.to = details.to;
    this.target = details.target;
    this.amount = details.amount;
    this.totalBalance = details.totalBalance;
    this.gasPrice = details.gasPrice;
    this.gas = details.gas;
  }

  static fromPlain(details: TxDetailsPlain): CreateEthereumTx {
    return new CreateEthereumTx(fromPlainDetails(details));
  }

  dump(): TxDetailsPlain {
    return toPlainDetails(this);
  }

  setFrom(from: string, balance: Wei) {
    this.from = from;
    this.totalBalance = balance;
  }

  validate(): ValidationResult {
    if (this.from == null || this.totalBalance == null) {
      return ValidationResult.NO_FROM;
    }
    if (this.to == null) {
      return ValidationResult.NO_TO;
    }
    if (this.getTotal().value.isGreaterThan(this.totalBalance.value)) {
      return ValidationResult.INSUFFICIENT_FUNDS;
    }
    return ValidationResult.OK;
  }

  validateTarget(): Boolean {
    if (this.target == TxTarget.SEND_ALL) {
      if (this.totalBalance == null) {
        return false;
      }
      return this.getTotal().equals(this.totalBalance);
    }
    return true;
  }

  getTotal(): Wei {
    return this.amount.plus(this.getFees());
  }

  getChange(): (Wei | null) {
    if (this.totalBalance == null) {
      return null
    }
    //TODO upgrade to latest Wei from emerald-js
    const res = new Wei(0);
    res.value = this.totalBalance.value.minus(this.getTotal().value);
    return res;
  }

  getFees(): Wei {
    return new Wei(this.gas.multipliedBy(this.gasPrice.value));
  }

  rebalance(): Boolean {
    if (this.target == TxTarget.SEND_ALL) {
      if (this.totalBalance == null) {
        return false;
      }
      //TODO upgrade to latest Wei from emerald-js
      const amount = this.totalBalance.value.minus(this.getFees().value);
      if (amount.isPositive() || amount.isZero()) {
        const res = new Wei(0);
        res.value = amount;
        this.amount = res;
        return true;
      }
      return false;
    }
    return true;
  }

  debug(): String {
    const change = this.getChange();
    return `Send ${this.from} -> ${this.to} of ${this.amount.toEther()} using ${this.gas} at ${this.gasPrice.toString(Units.MWEI, undefined, true)}.\n` +
           `Total to send: ${this.getTotal()} (${this.getFees()} are fees),` +
              `account has ${this.totalBalance} (${this.totalBalance == null ? null : this.totalBalance.toString(Units.WEI)} Wei), ` +
              `will have ${change} (${change == null ? null : change.toString(Units.WEI)} Wei)`

  }

}