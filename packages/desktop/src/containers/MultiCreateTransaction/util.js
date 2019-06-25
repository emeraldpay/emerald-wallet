// @flow
import {Currency} from '@emeraldwallet/core';
import { convert } from '@emeraldplatform/core';
import { Wei } from '@emeraldplatform/eth';

export function txFeeFiat(gasPrice, gasLimit, rate) {
  const wei = new Wei(gasPrice).mul(convert.toBigNumber(gasLimit));
  const ether = wei.toEther(18);
  return Currency.convert(ether.toString(), rate);
}

export const traceValidate = (chain, tx, dispatch, estimateGas): Promise<number> => {
  return new Promise((resolve, reject) => {
    dispatch(estimateGas(chain, tx))
      .then((gasEst) => {
        if (!gasEst) {
          reject('Invalid Transaction'); // eslint-disable-line
        } else if (gasEst > tx.gas.toNumber()) {
          reject(`Insufficient Gas. Expected ${gasEst}`); // eslint-disable-line
        } else {
          resolve(gasEst);
        }
      }).catch((error) => reject(error));
  });
};
