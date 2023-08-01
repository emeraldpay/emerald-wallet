import BigNumber from 'bignumber.js';

/**
 * Highest possible value for allowance, calculated as 2^256-1
 */
export const INFINITE_ALLOWANCE = new BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
/**
 * Max display value before showing infinite symbol, calculated as 2^128
 */
export const MAX_DISPLAY_ALLOWANCE = new BigNumber('0x100000000000000000000000000000000');
