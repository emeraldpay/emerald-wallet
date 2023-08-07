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

  if (value === '0x') {
    return 0;
  }

  return parseInt(value.substring(2), 16);
}

/**
 * Converts number, string or hex string into BigNumber
 */
export function toBigNumber(value: BigNumber | number | string): BigNumber {
  if (value instanceof BigNumber) {
    return value;
  }

  if (typeof value === 'string') {
    if (value === '0x') {
      return new BigNumber(0);
    }

    if (value.substring(0, 2) === '0x') {
      return new BigNumber(value.substring(2), 16);
    }
  }

  return new BigNumber(value, 10);
}

export function toHex(val: number | string | BigNumber): string {
  const hex = new BigNumber(val).toString(16);

  return `0x${hex.length % 2 !== 0 ? `0${hex}` : hex}`;
}

export function quantitiesToHex(val: number | string): string {
  return `0x${new BigNumber(val).toString(16)}`;
}
