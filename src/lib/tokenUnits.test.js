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
        convert.hexToBigNumber('0x0000000000000000000000000000000000000000000001f91aa96af86fe20680'),
       convert.hexToBigNumber('0x0000000000000000000000000000000000000000000000000000000000000012')
    );
    expect(units.getDecimalized()).toEqual('9317.526941554635310720');
});

describe('Token Converter', () => {
    it('convert token number to value', () => {
        expect(TokenUnits.fromCoins(1234, 8).value.toString()).toEqual('123400000000');
    });
    it('convert token number to value', () => {
        expect(TokenUnits.fromCoins(1234, 8).value).toEqual(new BigNumber('123400000000'));
    });
    it('convert token string to value', () => {
        expect(TokenUnits.fromCoins('1234', 2).value.toString()).toEqual('123400');
    });
    it('convert token decimals to value', () => {
        expect(TokenUnits.fromCoins('0.01', 8).value.toString()).toEqual('1000000');
    });
});
