import {Currency, CurrencyCode} from "./Currency";

describe('Currency', () => {
  it('should format', () => {
    expect(Currency.format(5, CurrencyCode.USD)).toEqual('$5.00');
  })
});
