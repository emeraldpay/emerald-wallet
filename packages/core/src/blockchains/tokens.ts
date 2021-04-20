import {BigAmount, Unit, Units} from "@emeraldpay/bigamount";
import {BigNumber} from 'bignumber.js';

export const DAI_UNITS = new Units([
  new Unit(18, "DAI", "DAI")
]);

export const WEENUS_UNITS = new Units([
  new Unit(18, "Weenus", "WEENUS")
]);

export const TETHER_UNITS = new Units([
  new Unit(6, "Tether", "USDT")
]);

export function tokenUnits(unit: string): Units {
  unit = unit?.toLowerCase() || "?";
  if (unit === "usdt" || unit == "tether") {
    return TETHER_UNITS;
  }
  if (unit === "dai") {
    return DAI_UNITS;
  }
  if (unit === "weenus") {
    return WEENUS_UNITS;
  }
  throw new Error("Unsupported token: " + unit)
}

export function tokenAmount(amount: BigNumber | string | number, unit: string): BigAmount {
  return new BigAmount(amount, tokenUnits(unit));
}