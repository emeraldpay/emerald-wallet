import { CoinTickerCode } from './blockchains';

export type StableCoinCode = 'DAI' | 'USDC' | 'USDT';
export type SupportedTokenCode = 'WEENUS' | 'WETH';

export function isStableCoinCode(value: string): value is StableCoinCode {
  return value === 'DAI' || value === 'USDC' || value === 'USDT';
}

export function isSupportedTokenCode(value: string): value is SupportedTokenCode {
  return value === 'WEENUS' || value === 'WETH';
}

export type AnyTokenCode = StableCoinCode | SupportedTokenCode;

export function isAnyTokenCode(value: string): value is AnyTokenCode {
  return isStableCoinCode(value) || isSupportedTokenCode(value);
}

export type AnyCoinCode = AnyTokenCode | CoinTickerCode;

export interface AssetDetail {
  title: string;
}

export const AssetDetails: Record<AnyCoinCode, AssetDetail> = {
  'BTC': { title: 'Bitcoin' },
  'DAI': { title: 'Dai' },
  'ETC': { title: 'Classic Ether' },
  'ETH': { title: 'Ether' },
  'TESTBTC': { title: 'Test Bitcoin' },
  'USDC': { title: 'USD Coin' },
  'USDT': { title: 'Tether' },
  'WETH': { title: 'Wrapped Ether' },
  'WEENUS': { title: 'Weenus' },
}
