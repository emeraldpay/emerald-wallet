import { BigAmount } from '@emeraldpay/bigamount';
import { AnyCoinCode, AnyTokenCode } from '../../Asset';

export enum ValidationResult {
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
  getAmount: () => T;
  getTokenSymbol: () => string;
  getTotalBalance: () => T;
  setAmount: (amount: T, tokenSymbol?: AnyTokenCode) => void;
  setTotalBalance: (total: T) => void;
}

export interface TxDetailsPlain {
  amount: string;
  amountDecimals: number;
  erc20?: string;
  from?: string;
  gas: number;
  gasPrice?: string;
  maxGasPrice?: string;
  priorityGasPrice?: string;
  target: number;
  to?: string;
  tokenSymbol: AnyCoinCode;
  totalEtherBalance?: string;
  totalTokenBalance?: string;
  transferType?: number;
}

export function targetFromNumber(value: number): TxTarget {
  if (value === TxTarget.SEND_ALL.valueOf()) {
    return TxTarget.SEND_ALL;
  }

  return TxTarget.MANUAL;
}
