import TokenUnits from './tokenUnits';

test('Decimalized works', () => {
    const units = new TokenUnits('0x05', '0x8');
    expect(units.value.toString()).toBe('5');
    expect(units.decimals.toString()).toBe('8');
    expect(units.getDecimalized()).toBe('0.00000005');
});
