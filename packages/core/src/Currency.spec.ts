import {Currency, CurrencySymbol} from "./Currency";

describe('Currency', () => {
  it('should format', () => {
    expect(Currency.format(5, CurrencySymbol.RUB)).toEqual('5,00 ₽');
  })
});
