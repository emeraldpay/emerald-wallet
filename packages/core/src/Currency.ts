import BigNumber from 'bignumber.js';
import {Units, Unit} from "@emeraldpay/bigamount";
import {BigAmount} from "@emeraldpay/bigamount";

export const enum CurrencyCode {
  RUB = 'RUB',
  USD = 'USD',
  EUR = 'EUR',
  AUD = 'AUD',
  CNY = 'CNY',
  KRW = 'KRW',
  GBP = 'GBP',
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
      case CurrencyCode.GBP: return 'en-GB';
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

export class CurrencyAmount extends BigAmount {

  /**
   * Create amount for the specified amount. Note that the value is in _cents_. I.e. use 1234 for $12.45
   *
   * @param valueCent
   * @param currency
   */
  constructor(valueCent: BigNumber | string | number, currency: string) {
    super(valueCent.toString(), new Units([
      new Unit(2, currency, currency)
    ]));
  }

  /**
   * Create for value specified as a main number, ex. as USD not US cents
   *
   * @param value
   * @param currency
   */
  static create(value: number, currency: string): CurrencyAmount {
    return new CurrencyAmount(value * 100, currency)
  }
}
