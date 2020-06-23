export type CoinTickerCode = 'ETC' | 'ETH' | 'BTC' | 'KOVAN';

export function isCoinTickerCode(value: string): value is CoinTickerCode {
  return value == 'ETC' || value == 'ETH' || value == 'BTC' || value == 'KOVAN';
}

export enum CoinTicker {
  ETC = 'ETC',
  ETH = 'ETH',
  BTC = 'BTC',
  KOVAN = 'KOVAN'
}
