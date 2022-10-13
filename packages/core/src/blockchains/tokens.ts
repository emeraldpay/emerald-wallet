import { BigAmount, Unit, Units } from '@emeraldpay/bigamount';
import { BigNumber } from 'bignumber.js';

export const DAI_UNITS = new Units([new Unit(18, 'DAI', 'DAI')]);
export const TETHER_UNITS = new Units([new Unit(6, 'Tether', 'USDT')]);
export const USDC_UNITS = new Units([new Unit(6, 'USD Coin', 'USDC')]);
export const WEENUS_UNITS = new Units([new Unit(18, 'Weenus', 'WEENUS')]);
export const WETC_UNITS = new Units([new Unit(18, 'Wrapped Ether Classic', 'WETC')]);
export const WETG_UNITS = new Units([new Unit(18, 'Wrapped Goerli Ether', 'WETG')]);
export const WETH_UNITS = new Units([new Unit(18, 'Wrapped Ether', 'WETH')]);

export function tokenUnits(unit: string): Units {
  switch (unit?.toUpperCase() ?? '?') {
    case 'DAI':
      return DAI_UNITS;
    case 'TETHER':
    case 'USDT':
      return TETHER_UNITS;
    case 'USDC':
      return USDC_UNITS;
    case 'WEENUS':
      return WEENUS_UNITS;
    case 'WETC':
      return WETC_UNITS;
    case 'WETG':
      return WETG_UNITS;
    case 'WETH':
      return WETH_UNITS;
  }

  throw new Error(`Unsupported token: ${unit}`);
}

export function tokenAmount(amount: BigNumber | string | number, unit: string): BigAmount {
  return new BigAmount(amount, tokenUnits(unit));
}
