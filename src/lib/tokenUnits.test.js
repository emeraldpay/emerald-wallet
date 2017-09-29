import { convert } from 'emerald-js';
import BigNumber from 'bignumber.js';
import TokenUnits from './tokenUnits';


test('Decimalized works', () => {
    const units = new TokenUnits(5, 8);
    expect(units.value.toString()).toBe('5');
    expect(units.decimals.toString()).toBe('8');
    expect(units.getDecimalized()).toBe('0.00000005');
});

test('Constructor', () => {
    const units = new TokenUnits(
        convert.toBigNumber('0x0000000000000000000000000000000000000000000001f91aa96af86fe20680'),
       convert.toBigNumber('0x0000000000000000000000000000000000000000000000000000000000000012')
    );
    expect(units.getDecimalized()).toEqual('9317.526941554635310720');
});