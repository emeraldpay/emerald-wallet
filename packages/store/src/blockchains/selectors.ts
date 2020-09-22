import { createSelector } from 'reselect';
import {IBlockchainsState, moduleName} from './types';
import {Wei} from '@emeraldpay/bigamount-crypto';

export function all (state: any): IBlockchainsState {
  return state[moduleName];
}

export const getCurrentInfo = createSelector(
  [all],
  (state: IBlockchainsState) => {
    return Object.keys(state).map((chainCode) => ({
      id: chainCode,
      title: chainCode,
      height: state[chainCode].height
    }));
  }
);

export function gasPrice (state: any, chain: string): Wei {
  return state[moduleName][chain.toLowerCase()].gasPrice;
}

export function getHeight (state: any, chain: string): number {
  const data = state[moduleName][chain.toLowerCase()];
  if (!data) {
    return 0;
  }
  if (!data.height) {
    return 0;
  }
  return data.height;
}

export function hasAny (state: any): boolean {
  return Object.keys(all(state)).length > 0;
}
