import { Units as EthUnits, Wei } from '@emeraldplatform/eth';
import BigNumber from 'bignumber.js';
import { DisplayEtherTx, IDisplayTx } from '..';
import { IUnits, Units } from '../../Units';
import { ITx, ITxDetailsPlain, targetFromNumber, TxTarget, ValidationResult } from './types';

export interface ITxDetails {
  from?: string;
  to?: string;
  target: TxTarget;
  amount: Wei;
  totalBalance?: Wei;
  gasPrice: Wei;
  gas: BigNumber;
}

const TxDefaults: ITxDetails = {
  amount: Wei.ZERO,
  gas: new BigNumber(21000),
  gasPrice: Wei.ZERO,
  target: TxTarget.MANUAL
};

function toPlainDetails (tx: ITxDetails): ITxDetailsPlain {
  return {
    amount: tx.amount.toString(EthUnits.WEI, 0, false),
    from: tx.from,
    gas: tx.gas.toNumber(),
    gasPrice: tx.gasPrice.toString(EthUnits.WEI, 0, false),
    target: tx.target.valueOf(),
    to: tx.to,
    totalTokenBalance: tx.totalBalance == null ? undefined : tx.totalBalance.toString(EthUnits.WEI, 0, false),
    amountDecimals: 18,
    totalEtherBalance: tx.totalBalance == null ? undefined : tx.totalBalance.toString(EthUnits.WEI, 0, false),
    tokenSymbol: EthUnits.ETHER.name
  };
}

function fromPlainDetails (plain: ITxDetailsPlain): ITxDetails {
  return {
    amount: new Wei(plain.amount, EthUnits.WEI),
    from: plain.from,
    gas: new BigNumber(plain.gas),
    gasPrice: new Wei(plain.gasPrice, EthUnits.WEI),
    target: targetFromNumber(plain.target),
    to: plain.to,
    totalBalance: plain.totalTokenBalance == null ? undefined : new Wei(plain.totalTokenBalance, EthUnits.WEI)
  };
}

export class CreateEthereumTx implements ITxDetails, ITx {

  public static fromPlain (details: ITxDetailsPlain): CreateEthereumTx {
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

  public dump (): ITxDetailsPlain {
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

  public getTotalBalance (): IUnits {
    return this.totalBalance ?
      new Units(this.totalBalance.value.toString(10), 18) :
      new Units(0, 18);
  }

  public getAmount (): IUnits {
    return new Units(this.amount.toWei().toString(10), 18);
  }

  public setAmount (a: IUnits) {
    this.amount = new Wei(a.amount, EthUnits.WEI);
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
    return `Send ${this.from} -> ${this.to} of ${this.amount.toEther()} using ${this.gas} at ${this.gasPrice.toString(EthUnits.MWEI, undefined, true)}.\n` +
           `Total to send: ${this.getTotal()} (${this.getFees()} are fees),` +
              `account has ${this.totalBalance} (${this.totalBalance == null ? null : this.totalBalance.toString(EthUnits.WEI)} Wei), ` +
              `will have ${change} (${change == null ? null : change.toString(EthUnits.WEI)} Wei)`;

  }

  public setTotalBalance (total: IUnits): void {
    this.totalBalance = new Wei(total.amount, EthUnits.WEI);
  }

  public getTokenSymbol (): string {
    return EthUnits.ETHER.name;
  }

}
