import TokenUnits from './tokenUnits';

test('Decimalized works', () => {
    const units = new TokenUnits('0x05', '0x8');
    expect(units.value.toString()).toBe('5');
    expect(units.decimals.toString()).toBe('8');
    expect(units.getDecimalized()).toBe('0.00000005');
});

test('Constructor', () => {
    const units = new TokenUnits('0x0000000000000000000000000000000000000000000001f91aa96af86fe20680',
       '0x0000000000000000000000000000000000000000000000000000000000000012');
    expect(units.getDecimalized()).toEqual('9317.526941554635310720');
});
