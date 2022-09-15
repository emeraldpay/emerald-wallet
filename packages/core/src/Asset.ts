import { BigAmount, Unit } from '@emeraldpay/bigamount';
import { SATOSHIS, Satoshi, WEIS, WEIS_ETC, Wei, WeiEtc } from '@emeraldpay/bigamount-crypto';
import { CoinTickerCode } from './blockchains';

export type StableCoinCode = 'DAI' | 'USDC' | 'USDT';
export type SupportedTokenCode = 'WEENUS' | 'WETH';

export function isStableCoinCode(value: string): value is StableCoinCode {
  return value === 'DAI' || value === 'USDC' || value === 'USDT';
}

export function isSupportedTokenCode(value: string): value is SupportedTokenCode {
  return value === 'WEENUS' || value === 'WETH';
}

export type AnyTokenCode = StableCoinCode | SupportedTokenCode | 'UNKNOWN';

export function isAnyTokenCode(value: string): value is AnyTokenCode {
  return isStableCoinCode(value) || isSupportedTokenCode(value);
}

export type AnyCoinCode = AnyTokenCode | CoinTickerCode;

export interface AssetDetail {
  title: string;
}

export const AssetDetails: Record<AnyCoinCode, AssetDetail> = {
  BTC: { title: 'Bitcoin' },
  DAI: { title: 'Dai' },
  ETC: { title: 'Classic Ether' },
  ETH: { title: 'Ether' },
  TESTBTC: { title: 'Test Bitcoin' },
  USDC: { title: 'USD Coin' },
  USDT: { title: 'Tether' },
  WETH: { title: 'Wrapped Ether' },
  WEENUS: { title: 'Weenus' },
  UNKNOWN: { title: 'Unknown token' },
};

export function getStandardUnits(amount: BigAmount): Unit[] | undefined {
  if (Satoshi.is(amount)) {
    return [SATOSHIS.units[0], SATOSHIS.units[3], SATOSHIS.units[4]];
  }

  if (WeiEtc.is(amount)) {
    return [WEIS_ETC.units[0], WEIS_ETC.units[3], WEIS_ETC.units[5], WEIS_ETC.units[6]];
  }

  if (Wei.is(amount)) {
    return [WEIS.units[0], WEIS.units[3], WEIS.units[5], WEIS.units[6]];
  }

  return undefined;
}
