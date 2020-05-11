import { addHexPrefix, isHex, parseDate, separateThousands } from './utils';

describe('addHexPrefix', () => {
  it('should work', () => {
    expect(addHexPrefix('01')).toEqual('0x01');
    expect(addHexPrefix('0x01')).toEqual('0x01');
  });
});

describe('isHex', () => {
  it('valid hex string', () => {
    expect(isHex('0x51fe')).toBeTruthy();
    expect(isHex('')).toBeTruthy();
    expect(isHex('aaaCCeeee')).toBeTruthy();
  });
  it('invalid hex', () => {
    expect(isHex('0xgghh51fe')).not.toBeTruthy();
    expect(isHex('aaa0xeeee')).not.toBeTruthy();
  });
});

describe('Number formatting', () => {
  it('format number with separated thousands', () => {
    expect(separateThousands('123456789', ' ')).toEqual('123 456 789');
    expect(separateThousands('123456789', '*')).toEqual('123*456*789');
  });
});

describe('Parse date', () => {
  it('ISO string', () => {
    expect(parseDate('2019-10-15T21:48:43.627Z')!.toISOString()).toBe('2019-10-15T21:48:43.627Z');
  });

  it('unix time', () => {
    expect(parseDate(1571176188)!.toISOString()).toBe('2019-10-15T21:49:48.000Z');
  });

  it('millis time', () => {
    expect(parseDate(1571176448659)!.toISOString()).toBe('2019-10-15T21:54:08.659Z');
  });

  it('Date object', () => {
    const date = new Date(1571176448659);
    expect(parseDate(date)!.toISOString()).toBe('2019-10-15T21:54:08.659Z');
  });

  it('undefined', () => {
    expect(parseDate(undefined, new Date(1571176448659))!.toISOString()).toBe('2019-10-15T21:54:08.659Z');
    expect(parseDate(undefined)).toBeUndefined();
  });
});
