import BigNumber from 'bignumber.js';

type Numeric = number | string | null | undefined;

/**
 * Convert hex to number
 */
export function toNumber(hex: Numeric, defaultValue = 0): number {
  if (hex == null) {
    return defaultValue;
  }

  if (typeof hex === 'number') {
    return hex;
  }

  if (hex === '0x') {
    return 0;
  }

  return parseInt(hex, 16);
}

/**
 * Converts number, string or hex string into BigNumber
 */
export function toBigNumber(value: BigNumber | Numeric, defaultValue = new BigNumber(0)): BigNumber {
  if (value == null) {
    return defaultValue;
  }

  if (value instanceof BigNumber) {
    return value;
  }

  if (typeof value === 'string') {
    if (value === '0x') {
      return new BigNumber(0);
    }

    return new BigNumber(value, 16);
  }

  return new BigNumber(value, 10);
}

/**
 * Converts number, string or BigNumber into hex string
 */
export function toHex(value: BigNumber | Numeric, defaultValue = '0x'): string {
  if (value == null) {
    return defaultValue;
  }

  let hex: string;

  if (BigNumber.isBigNumber(value)) {
    hex = value.toString(16);
  } else {
    hex = new BigNumber(value).toString(16);
  }

  return `0x${hex}`;
}
