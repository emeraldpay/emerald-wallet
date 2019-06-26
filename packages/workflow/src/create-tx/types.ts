export enum TxTarget {
  MANUAL,
  SEND_ALL
}

export function targetFromNumber(i: number): TxTarget {
  if (i == TxTarget.SEND_ALL.valueOf()) {
    return TxTarget.SEND_ALL
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