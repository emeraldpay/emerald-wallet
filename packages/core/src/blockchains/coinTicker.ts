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

export function isEthereumCoinTicker(asset: string): boolean {
  return asset === CoinTicker.ETC || asset === CoinTicker.ETH || asset === CoinTicker.ETG;
}
