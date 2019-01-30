// @flow
import { convert } from '@emeraldplatform/emerald-js';

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
