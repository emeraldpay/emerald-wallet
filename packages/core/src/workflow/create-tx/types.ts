import { IUnits } from '../../Units';

export enum TxTarget {
  MANUAL,
  SEND_ALL
}

export function targetFromNumber (i: number): TxTarget {
  if (i === TxTarget.SEND_ALL.valueOf()) {
    return TxTarget.SEND_ALL;
  }
  return TxTarget.MANUAL;
}

export enum ValidationResult {
  OK,
  NO_FROM,
  NO_TO,
  INSUFFICIENT_FUNDS,
  INSUFFICIENT_TOKEN_FUNDS
}

export interface ITx {
  getTotalBalance: () => IUnits;
  getAmount: () => IUnits;
  setAmount: (amount: IUnits) => void;
}
