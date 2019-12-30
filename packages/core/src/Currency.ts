import BigNumber from 'bignumber.js';

export const enum CurrencyCode {
  RUB = 'RUB',
  USD = 'USD',
  EUR = 'EUR',
  AUD = 'AUD',
  CNY = 'CNY',
  KRW = 'KRW',
  MONOPOLY = 'MONOPOLY'
}

export class Currency {
  public static format (value: number, currency: CurrencyCode): string {
    const formatter = new Intl.NumberFormat(Currency.locale(currency), {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      currencyDisplay: 'symbol'
    });
    return formatter.format(value);
  }

  public static locale (currencySymbol: string): string {
    switch (currencySymbol.toUpperCase()) {
      case CurrencyCode.RUB: return 'ru-RU';
      case CurrencyCode.USD: return 'en-US';
      case CurrencyCode.AUD: return 'en-AU';
      case CurrencyCode.EUR: return 'de-DE';
      case CurrencyCode.CNY: return 'zh-CN';
      case CurrencyCode.KRW: return 'ko-KR';
      default: return 'en-US';
    }
  }

  public static convert (value: string, rate: number, decimals: number = 2): string {
    const v = new BigNumber(value, 10);
    const r = ((rate === null) || (typeof rate === 'undefined'))
      ? new BigNumber(0)
      : new BigNumber(rate.toString());
    return v.multipliedBy(r).toFixed(decimals);
  }
}
