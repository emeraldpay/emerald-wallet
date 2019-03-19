// @flow
import BigNumber from 'bignumber.js';
import { Record } from 'immutable';

const ZERO = new BigNumber(0);
const ONE = new BigNumber(1);

export default class TokenUnits extends Record({ value: ZERO, decimals: 0 }) {
  constructor(value: BigNumber, decimals: BigNumber | number) {
    if (!value) {
      throw new Error(`Invalid value: ${value}`);
    }
    let d;
    if (typeof decimals === 'number') {
      d = decimals;
    } else {
      d = decimals.toNumber();
    }

    super({
      value: new BigNumber(value),
      decimals: d,
    });
  }

  getDecimalized(precision?: number): string {
    if (!precision) {
      precision = this.decimals;
    }
    const divisor = new BigNumber(10).pow(this.decimals);
    return this.value.dividedBy(divisor).toFixed(precision);
  }

  convert(r: number, decimals: number = 2): string {
    const rate = (r === null || typeof r === 'undefined')
      ? ZERO
      : new BigNumber(r.toString());
    const divisor = new BigNumber(10).pow(this.decimals);
    return this.value.dividedBy(divisor).multipliedBy(rate).toFixed(decimals);
  }
}
