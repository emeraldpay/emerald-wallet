import { BigAmount, Unit, Units } from '@emeraldpay/bigamount';
import { BigNumber } from 'bignumber.js';

export const DAI_UNITS = new Units([new Unit(18, 'DAI', 'DAI')]);
export const TETHER_UNITS = new Units([new Unit(6, 'Tether', 'USDT')]);
export const USDC_UNITS = new Units([new Unit(6, 'USD Coin', 'USDC')]);
export const WEENUS_UNITS = new Units([new Unit(18, 'Weenus', 'WEENUS')]);
export const WETG_UNITS = new Units([new Unit(18, 'Wrapped Goerli Ether', 'WETG')]);
export const WETH_UNITS = new Units([new Unit(18, 'Wrapped Ether', 'WETH')]);

export function tokenUnits(unit: string): Units {
  switch (unit?.toLowerCase() ?? '?') {
    case 'dai':
      return DAI_UNITS;
    case 'tether':
    case 'usdt':
      return TETHER_UNITS;
    case 'usdc':
      return USDC_UNITS;
    case 'weenus':
      return WEENUS_UNITS;
    case 'wetg':
      return WETG_UNITS;
    case 'weth':
      return WETH_UNITS;
  }

  throw new Error(`Unsupported token: ${unit}`);
}

export function tokenAmount(amount: BigNumber | string | number, unit: string): BigAmount {
  return new BigAmount(amount, tokenUnits(unit));
}
