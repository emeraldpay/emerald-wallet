// @flow
import {Currency} from '@emeraldwallet/core';
import { fromBaseUnits, convert } from '@emeraldplatform/core';
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

export const traceValidate = (tx, dispatch, estimateGas): Promise<number> => {
  return new Promise((resolve, reject) => {
    dispatch(estimateGas(tx.from, tx.to, tx.gas, tx.gasPrice, tx.value, tx.data))
      .then((gasEst) => {
        if (!gasEst) {
          reject('Invalid Transaction'); // eslint-disable-line
        } else if (gasEst > convert.toNumber(tx.gas)) {
          reject(`Insufficient Gas. Expected ${gasEst}`); // eslint-disable-line
        } else {
          resolve(gasEst);
        }
      }).catch((error) => reject(error));
  });
};
