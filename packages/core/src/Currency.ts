// @flow
import BigNumber from 'bignumber.js';

export const enum CurrencySymbol {
  RUB = "RUB"
}

export class Currency {
  static format(value: number, currency: CurrencySymbol): string {
    const formatter = new Intl.NumberFormat(Currency.locale(currency), {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    });
    return formatter.format(value);
  }

  static locale(currencySymbol: string): string {
    switch (currencySymbol.toUpperCase()) {
      case CurrencySymbol.RUB: return 'ru-RU';
      case 'USD': return 'en-US';
      case 'AUD': return 'en-AU';
      case 'EUR': return 'de-DE';
      case 'CNY': return 'zh-CN';
      case 'KRW': return 'ko-KR';
      default: return 'en-US';
    }
  }

  static convert(value: string, rate: number, decimals: number = 2): string {
    const v = new BigNumber(value, 10);
    const r = ((rate === null) || (typeof rate === 'undefined'))
      ? new BigNumber(0)
      : new BigNumber(rate.toString());
    return v.multipliedBy(r).toFixed(decimals);
  }
}
