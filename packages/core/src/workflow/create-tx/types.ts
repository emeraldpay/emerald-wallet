import {BigAmount} from "@emeraldpay/bigamount";
import {AnyCoinCode, AnyTokenCode} from "../../Asset";

export enum TxTarget {
  MANUAL,
  SEND_ALL
}

export function targetFromNumber(i: number): TxTarget {
  if (i === TxTarget.SEND_ALL.valueOf()) {
    return TxTarget.SEND_ALL;
  }
  return TxTarget.MANUAL;
}

export enum ValidationResult {
  OK,
  NO_FROM,
  NO_AMOUNT,
  NO_TO,
  INSUFFICIENT_FUNDS,
  INSUFFICIENT_TOKEN_FUNDS
}

export interface ITx<T extends BigAmount> {
  getTotalBalance: () => T;
  setTotalBalance: (total: T) => void;
  getAmount: () => T;
  setAmount: (amount: T, tokenSymbol?: AnyTokenCode) => void;
  getTokenSymbol: () => string;
}

export interface ITxDetailsPlain {
  from?: string;
  to?: string;
  erc20?: string;
  target: number;
  amount: string;
  amountDecimals: number;
  tokenSymbol: AnyCoinCode;
  totalTokenBalance?: string;
  totalEtherBalance?: string;
  gasPrice: string;
  gas: number;
  transferType?: number;
}
