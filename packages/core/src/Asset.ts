import {BlockchainCode} from './blockchains';
import {CoinTicker, CoinTickerCode} from './blockchains/CoinTicker';

export type StableCoinCode = 'DAI' | 'USDT' | 'SAI';
export type SupportedTokenCode = 'BEC' | 'WEENUS';

export function isStableCoinCode(value: string): value is StableCoinCode {
  return value == 'DAI' || value == 'USDT' || value == 'SAI';
}

export function isSupportedTokenCode(value: string): value is SupportedTokenCode {
  return value == 'BEC' || value == 'WEENUS';
}

export type AnyTokenCode = StableCoinCode | SupportedTokenCode;

export function isAnyTokenCode(value: string): value is AnyTokenCode {
  return isStableCoinCode(value) || isStableCoinCode(value);
}

export type AnyCoinCode = AnyTokenCode | CoinTickerCode;
