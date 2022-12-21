import { Unit } from '@emeraldpay/bigamount';

export interface DisplayTx {
  amount(): string;
  amountUnit(): string;
  fee(): string;
  feeUnit(): string;
  feeCost(): string;
  feeCostUnit(): string;
  topUnit(): Unit;
}
