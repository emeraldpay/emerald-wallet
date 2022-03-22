import BigNumber from 'bignumber.js';

/**
 * Convert hex string to number
 *
 * @param value
 * @param defaultValue
 * @returns {number}
 */
export function toNumber(value: string | number, defaultValue = 0): number {
  if (!value) {
    return defaultValue;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value !== 'string') {
    throw new Error(`Invalid argument type ${typeof value}`);
  }
  if (value === '0x') {
    return 0;
  }
  return parseInt(value.substring(2), 16);
}

const ZERO = new BigNumber(0);

/**
 * Converts number, string or hex string into BigNumber
 */
export function toBigNumber(value: string | number | BigNumber, defaultValue: BigNumber = ZERO): BigNumber {
  if (!value) {
    return defaultValue;
  }
  if (value instanceof BigNumber) {
    return value;
  }
  if (typeof value === 'string') {
    if (value === '0x') {
      return ZERO;
    }
    if (value.substring(0, 2) === '0x') {
      return new BigNumber(value.substring(2), 16);
    }
  }
  return new BigNumber(value, 10);
}

export function toHex(val: number | string | BigNumber): string {
  const hex = new BigNumber(val).toString(16);
  return `0x${(hex.length % 2 !== 0 ? `0${hex}` : hex)}`;
}

export function quantitiesToHex(val: number | string): string {
  return `0x${new BigNumber(val).toString(16)}`;
}

/**
 * @deprecated use BigAmount
 * Convert amount to smallest denomination of token or any currency
 * For example, amount 1 ether with 18 decimal places will be converted into 1*10^18 base units
 * (i.e. 1*10^18 wei)
 */
export function toBaseUnits(amount: BigNumber | string, decimals: number): BigNumber {
  const v = (typeof amount === 'string') ? new BigNumber(amount) : amount;
  const unit = new BigNumber(10).pow(decimals);
  return v.times(unit);
}

/**
 *
 * @deprecated use BigAmount
 * @param amount
 * @param decimals
 */
export function fromBaseUnits(amount: BigNumber | string, decimals: number): BigNumber {
  const v = (typeof amount === 'string') ? new BigNumber(amount) : amount;
  const unit = new BigNumber(10).pow(decimals);
  return v.div(unit);
}
