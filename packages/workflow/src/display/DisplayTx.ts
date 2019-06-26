
export interface DisplayTx {

  amount(): string;
  amountUnit(): string;
  fee(): string;
  feeUnit(): string;
  feeCost(): string;
  feeCostUnit(): string;

}