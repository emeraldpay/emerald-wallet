// @flow
import {Currency} from '@emeraldwallet/core';
import { convert } from '@emeraldplatform/core';
import { Wei } from '@emeraldplatform/eth';

export function txFee(gasPrice, gasLimit) {
  return new Wei(gasPrice).mul(convert.toBigNumber(gasLimit));
}

export function txFeeFiat(gasPrice, gasLimit, rate) {
  const wei = new Wei(gasPrice).mul(convert.toBigNumber(gasLimit));
  const ether = wei.toEther(18);
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
