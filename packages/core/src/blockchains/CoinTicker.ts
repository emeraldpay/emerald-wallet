export enum CoinTicker {
  // Mainnet
  BTC = 'BTC',
  ETC = 'ETC',
  ETH = 'ETH',
  // Testnet
  ETG = 'ETG',
  TESTBTC = 'TESTBTC',
}

export type CoinTickerCode = 'BTC' | 'ETC' | 'ETH' | 'ETG' | 'TESTBTC';

export function isCoinTickerCode(value: string): value is CoinTickerCode {
  return value === 'BTC' || value === 'ETC' || value === 'ETH' || value === 'ETG' || value === 'TESTBTC';
}
