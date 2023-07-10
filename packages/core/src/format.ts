import { BigAmount, FormatterBuilder, Predicates } from '@emeraldpay/bigamount';
import { getStandardUnits } from './asset';

export function formatAmount(amount: BigAmount, decimals = 3): string {
  const formatter = new FormatterBuilder()
    .when(Predicates.ZERO, (whenTrue, whenFalse): void => {
      whenTrue.useTopUnit();
      whenFalse.useOptimalUnit(undefined, getStandardUnits(amount), decimals);
    })
    .number(decimals, true)
    .append(' ')
    .unitCode()
    .build();

  return formatter.format(amount);
}

export function formatAmountPartial(amount: BigAmount, decimals = 3): [string, string] {
  const selectUnit = (whenTrue: FormatterBuilder, whenFalse: FormatterBuilder): void => {
    whenTrue.useTopUnit();
    whenFalse.useOptimalUnit(undefined, getStandardUnits(amount), decimals);
  };

  const valueFormatter = new FormatterBuilder().when(Predicates.ZERO, selectUnit).number(decimals, true).build();
  const unitFormatter = new FormatterBuilder().when(Predicates.ZERO, selectUnit).unitCode().build();

  return [valueFormatter.format(amount), unitFormatter.format(amount)];
}

export function formatFiatAmount(amount: BigAmount, decimals = 2): string {
  const formatter = new FormatterBuilder().useTopUnit().number(decimals).append(' ').unitCode().build();

  return formatter.format(amount);
}

export function formatFiatAmountPartial(amount: BigAmount, decimals = 2): [string, string] {
  const valueFormatter = new FormatterBuilder().useTopUnit().number(decimals).build();
  const unitFormatter = new FormatterBuilder().useTopUnit().unitCode().build();

  return [valueFormatter.format(amount), unitFormatter.format(amount)];
}
