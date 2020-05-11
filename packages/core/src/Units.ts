import { fromBaseUnits } from '@emeraldplatform/core';
import BigNumber from 'bignumber.js';

export interface IUnits {
  readonly amount: string;
  readonly decimals: number;

  equals: (another: IUnits) => boolean;
  minus: (another: IUnits) => IUnits;
  isGreaterThan: (another: IUnits) => boolean;
  toString: () => string;
  amountAsString: (format?: any) => string;
}

/**
 * Type for every currency base units
 * Ethereum - wei
 * Bitcoin - satoshi
 * ERC20 - token base units
 */
export class Units implements IUnits {
  public static ZERO: IUnits = new Units('0', 0);

  public static isUnits (value: any): value is Units {
    return typeof value === 'object'
      && Object.keys(value).every((k) => k === 'amount' || k === 'decimals');
  }
  public amount: string;
  public decimals: number;

  constructor (amount: string | number | BigNumber, decimals: number) {
    let bAmount;
    if (BigNumber.isBigNumber(amount)) {
      bAmount = amount;
    } else {
      bAmount = new BigNumber(amount);
    }
    if (bAmount.isNaN()) {
      throw new Error('Invalid value of amount: ' + amount);
    }
    this.amount = bAmount.toString(10);
    this.decimals = decimals;
  }

  public toString (): string {
    return fromBaseUnits(this.amount, this.decimals).toString(10);
  }

  public equals (another: IUnits): boolean {
    return (this.amount === another.amount) && (this.decimals === another.decimals);
  }

  public isGreaterThan (another: IUnits): boolean {
    if (!this.isSameSize(another)) {
      throw new Error('Can not compare units with different decimals');
    }
    const v = new BigNumber(this.amount);
    const a = new BigNumber(another.amount);
    return v.isGreaterThan(a);
  }

  public minus (another: IUnits): IUnits {
    const v = new BigNumber(this.amount);
    const a = new BigNumber(another.amount);
    return new Units(v.minus(a).toString(10), this.decimals);
  }

  public toBigNumber (): BigNumber {
    return new BigNumber(this.amount);
  }

  public amountAsString (format?: any): string {
    const fmt = format ? format : {
      decimalSeparator: '.',
      groupSeparator: ',',
      groupSize: 3
    };
    return new BigNumber(this.amount).toFormat(2, fmt);
  }

  private isSameSize (another: IUnits): boolean {
    return this.decimals === another.decimals;
  }

}

export default Units;
