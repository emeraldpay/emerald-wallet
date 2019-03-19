import {Currency} from '@emeraldwallet/core';
import { fromBaseUnits } from '@emeraldplatform/core';
import BigNumber from 'bignumber.js';

export function txFee(gasPrice, gasLimit) {
  const wei = (new BigNumber(gasPrice)).multipliedBy(new BigNumber(gasLimit));
  const ether = fromBaseUnits(wei, 18);
  return ether.toFixed(5);
}

export function txFeeFiat(gasPrice, gasLimit, rate) {
  const wei = (new BigNumber(gasPrice)).multipliedBy(new BigNumber(gasLimit));
  const ether = fromBaseUnits(wei, 18);
  return Currency.convert(ether.toString(), rate);
}
