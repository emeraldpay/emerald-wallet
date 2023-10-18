import { BigAmount } from '@emeraldpay/bigamount';
import BigNumber from 'bignumber.js';
import { BlockchainCode } from '../../blockchains';

export enum ValidationResult {
  INSUFFICIENT_FEE_PRICE,
  INSUFFICIENT_FUNDS,
  INSUFFICIENT_TOKEN_FUNDS,
  NO_AMOUNT,
  NO_FROM,
  NO_TO,
  OK,
}

export enum TxTarget {
  MANUAL,
  SEND_ALL,
}

export interface Tx<T extends BigAmount> {
  getAmount(): T;
  getAsset(): string;
  getTotalBalance(): T;
  setAmount(amount: T | BigNumber, tokenSymbol?: string): void;
  setTotalBalance(total: T): void;
}

export interface TxDetailsPlain {
  amount: string;
  amountDecimals: number;
  asset: string;
  blockchain: BlockchainCode;
  from?: string;
  gas: number;
  gasPrice?: string;
  maxGasPrice?: string;
  priorityGasPrice?: string;
  target: number;
  to?: string;
  totalEtherBalance?: string;
  totalTokenBalance?: string;
  transferFrom?: string;
  type: string;
}

export function targetFromNumber(value: number): TxTarget {
  if (value === TxTarget.SEND_ALL.valueOf()) {
    return TxTarget.SEND_ALL;
  }

  return TxTarget.MANUAL;
}
