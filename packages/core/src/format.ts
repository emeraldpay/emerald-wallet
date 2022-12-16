import { BigAmount, FormatterBuilder, Predicates } from '@emeraldpay/bigamount';
import { getStandardUnits } from './asset';

export function formatAmount(amount: BigAmount, decimals = 3): string {
  const units = getStandardUnits(amount);

  const amountFormatter = new FormatterBuilder()
    .when(Predicates.ZERO, (whenTrue, whenFalse): void => {
      whenTrue.useTopUnit();
      whenFalse.useOptimalUnit(undefined, units, decimals);
    })
    .number(decimals, true)
    .append(' ')
    .unitCode()
    .build();

  return amountFormatter.format(amount);
}
