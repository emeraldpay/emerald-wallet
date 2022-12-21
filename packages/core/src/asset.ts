import { BigAmount, Unit } from '@emeraldpay/bigamount';
import { SATOSHIS, Satoshi, WEIS, WEIS_ETC, Wei, WeiEtc } from '@emeraldpay/bigamount-crypto';

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
