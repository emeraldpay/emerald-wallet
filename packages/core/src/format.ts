import { BigAmount, FormatterBuilder, Predicates } from '@emeraldpay/bigamount';
import { getStandardUnits } from './asset';

type ApproxZeroHandler = (approxZero: boolean) => void;

function prepareFormatter(
  amount: BigAmount,
  decimals: number,
  showApproxZero = false,
  onApproxZero?: ApproxZeroHandler,
): FormatterBuilder {
  const formatter = new FormatterBuilder();

  const units = getStandardUnits(amount);

  if (showApproxZero) {
    formatter.when(
      () => {
        const unit = amount.getOptimalUnit(undefined, units, decimals);
        const value = amount.getNumberByUnit(unit).multipliedBy(10 ** decimals);

        const approxZero = value.gt(0) && value.lt(1);

        onApproxZero?.(approxZero);

        return approxZero;
      },
      (whenTrue) => whenTrue.append('≈'),
    );
  }

  return formatter.when(Predicates.ZERO, (whenTrue, whenFalse): void => {
    whenTrue.useTopUnit();
    whenFalse.useOptimalUnit(undefined, units, decimals);
  });
}

export function formatAmount(amount: BigAmount, decimals = 3): string {
  const formatter = prepareFormatter(amount, decimals, true).number(decimals, true).append(' ').unitCode();

  return formatter.build().format(amount);
}

export function formatAmountPartial(amount: BigAmount, decimals = 3): [string, string, boolean] {
  let approxZero = false;

  const onApproxZero: ApproxZeroHandler = (hasZeros) => {
    approxZero = hasZeros;
  };

  const valueFormatter = prepareFormatter(amount, decimals, true, onApproxZero).number(decimals, true);
  const unitFormatter = prepareFormatter(amount, decimals).unitCode();

  return [valueFormatter.build().format(amount), unitFormatter.build().format(amount), approxZero];
}

export function formatAmountValue(amount: BigAmount, decimals = 9): string {
  const formatter = prepareFormatter(amount, decimals, false).number(decimals, true, undefined, {
    decimalSeparator: '.',
    groupSeparator: '',
  });

  return formatter.build().format(amount);
}

export function formatFiatAmount(amount: BigAmount, decimals = 2): string {
  const formatter = new FormatterBuilder().useTopUnit().number(decimals).append(' ').unitCode();

  return formatter.build().format(amount);
}

export function formatFiatAmountPartial(amount: BigAmount, decimals = 2): [string, string] {
  const valueFormatter = new FormatterBuilder().useTopUnit().number(decimals);
  const unitFormatter = new FormatterBuilder().useTopUnit().unitCode();

  return [valueFormatter.build().format(amount), unitFormatter.build().format(amount)];
}
