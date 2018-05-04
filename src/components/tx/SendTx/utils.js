// @flow
import { convert } from 'emerald-js';

export const traceValidate = (tx, dispatch, estimateGas): Promise<number> => {
  return new Promise((resolve, reject) => {
    dispatch(estimateGas(tx.from, tx.to, tx.gas, tx.gasPrice, tx.value, tx.data))
      .then((gasEst) => {
        if (!gasEst) {
          reject('Invalid Transaction');
        } else if (gasEst > convert.toNumber(tx.gas)) {
          reject(`Insufficient Gas. Expected ${gasEst}`);
        } else {
          resolve(gasEst);
        }
      }).catch((error) => reject(error));
  });
};
