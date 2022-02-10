export type CoinTickerCode = 'ETC' | 'ETH' | 'BTC' | 'TESTBTC';

export function isCoinTickerCode(value: string): value is CoinTickerCode {
  return value == 'ETC' || value == 'ETH' || value == 'BTC' || value == 'TESTBTC';
}

export enum CoinTicker {
  ETC = 'ETC',
  ETH = 'ETH',
  BTC = 'BTC',
  TESTBTC = 'TESTBTC',
}
