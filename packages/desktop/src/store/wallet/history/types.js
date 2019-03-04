// @flow
import BigNumber from 'bignumber.js';

export type Transaction = {
  hash: string,
  value: BigNumber,
  gasPrice: BigNumber,
  gas: number,
  from: string,
  to: string,
  data: string,
  input: string,
  nonce: number,
};
