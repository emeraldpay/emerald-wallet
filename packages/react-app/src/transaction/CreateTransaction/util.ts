import { WEIS, Wei } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, Currency, toBigNumber } from '@emeraldwallet/core';

export function txFeeFiat(gasPrice: string | number, gasLimit: number, rate: number | undefined): string {
  if (typeof rate == 'undefined') {
    return '--';
  }
  const wei = new Wei(gasPrice).multiply(toBigNumber(gasLimit));
  const ether = wei.number.dividedBy(WEIS.top.multiplier);
  return Currency.convert(ether.toFixed(), rate);
}

export const traceValidate = (chain: BlockchainCode, tx: any, dispatch: any, estimateGas: any): Promise<number> => {
  return new Promise((resolve, reject) => {
    dispatch(estimateGas(chain, tx))
      .then((gasEst: number) => {
        if (!gasEst) {
          reject('Invalid Transaction');
        } else if (gasEst > tx.gas) {
          reject(`Insufficient Gas. Expected ${gasEst}`);
        } else {
          resolve(gasEst);
        }
      })
      .catch((error: any) => {
        reject(error);
      });
  });
};
