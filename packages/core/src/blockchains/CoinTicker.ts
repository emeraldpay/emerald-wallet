export type CoinTickerCode = 'ETC' | 'ETH' | 'BTC' | 'KOVAN' | 'TESTBTC';

export function isCoinTickerCode(value: string): value is CoinTickerCode {
  return value == 'ETC' || value == 'ETH' || value == 'BTC' || value == 'KOVAN' || value == 'TESTBTC';
}

export enum CoinTicker {
  ETC = 'ETC',
  ETH = 'ETH',
  BTC = 'BTC',
  TESTBTC = 'TESTBTC',
  KOVAN = 'KOVAN'
}
