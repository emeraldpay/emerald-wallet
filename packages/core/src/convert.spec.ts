import BigNumber from 'bignumber.js';
import * as convert from './convert';

const {
  toNumber, toHex, toBigNumber, quantitiesToHex,
} = convert;

test('toNumber should convert hex string to number', () => {
  expect(toNumber('0x01')).toBe(1);
  expect(toNumber('0x')).toBe(0);
  expect(toNumber('0xF')).toBe(15);
});

test('toNumber should convert number to number', () => {
  expect(toNumber(1)).toBe(1);
  expect(toNumber(0)).toBe(0);
  expect(toNumber(15)).toBe(15);
  expect(toNumber(-1)).toBe(-1);
  expect(toNumber(-15)).toBe(-15);
});

test('toNumber should accept empty', () => {
  // @ts-ignore
  expect(toNumber(null)).toBe(0);
  // @ts-ignore
  expect(toNumber(undefined)).toBe(0);

  // @ts-ignore
  expect(toNumber(null, -1)).toBe(-1);
  // @ts-ignore
  expect(toNumber(undefined, 10)).toBe(10);
});

describe('quantitiesToHex', () => {
  it('converts without leading zeros', () => {
    expect(quantitiesToHex(1024)).toEqual('0x400');
    expect(quantitiesToHex(0)).toEqual('0x0');
  });
});

describe('toHex', () => {
  it('convert decimal number to hex', () => {
    expect(toHex(10000000000)).toEqual('0x02540be400');
    expect(toHex('21000')).toEqual('0x5208');
    expect(toHex('100000000000000000000')).toEqual('0x056bc75e2d63100000');
  });

  it('convert BigNumber to hex', () => {
    expect(toHex(new BigNumber(21000))).toEqual('0x5208');
  });

  it('convert hex to hex', () => {
    expect(toHex('0x01')).toEqual('0x01');
  });
});

describe('toBigNumber', () => {
  it('convert 0x to zero', () => {
    expect(toBigNumber('0x')).toEqual(new BigNumber(0));
  });

  it('convert hex string to BigNumber', () => {
    expect(toBigNumber('0xA')).toEqual(new BigNumber(10));
    expect(toBigNumber('0x0A')).toEqual(new BigNumber(10));
    expect(toBigNumber('0x1A')).toEqual(new BigNumber(26));
  });
});
