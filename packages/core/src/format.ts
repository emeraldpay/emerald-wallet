import { BigAmount, FormatterBuilder, Predicates } from '@emeraldpay/bigamount';
import { getStandardUnits } from './asset';

type ApproxZeroHandler = (approxZero: boolean) => void;

interface FormatterOptions {
  adjustUnit?: boolean;
  showApproxZero?: boolean;
  onApproxZero?: ApproxZeroHandler;
}

function prepareFormatter(amount: BigAmount, decimals: number, options?: FormatterOptions): FormatterBuilder {
  const formatter = new FormatterBuilder();

  const { adjustUnit = true, showApproxZero = false } = options ?? {};

  if (adjustUnit || showApproxZero) {
    const units = getStandardUnits(amount);

    if (adjustUnit) {
      formatter.when(Predicates.ZERO, (whenTrue, whenFalse): void => {
        whenTrue.useTopUnit();
        whenFalse.useOptimalUnit(undefined, units, decimals);
      });
    }

    if (showApproxZero) {
      formatter.when(
        () => {
          const unit = amount.getOptimalUnit(undefined, units, decimals);
          const value = amount.getNumberByUnit(unit).multipliedBy(10 ** decimals);

          const approxZero = value.gt(0) && value.lt(1);

          options?.onApproxZero?.(approxZero);

          return approxZero;
        },
        (whenTrue) => whenTrue.append('≈'),
      );
    }
  }

  return formatter;
}

export function formatAmount(amount: BigAmount, decimals = 3): string {
  const formatter = prepareFormatter(amount, decimals, { showApproxZero: true })
    .number(decimals, true)
    .append(' ')
    .unitCode();

  return formatter.build().format(amount);
}

export function formatAmountPartial(amount: BigAmount, decimals = 3): [string, string, boolean] {
  let approxZero = false;

  const options: FormatterOptions = {
    showApproxZero: true,
    onApproxZero(hasZeros) {
      approxZero = hasZeros;
    },
  };

  const valueFormatter = prepareFormatter(amount, decimals, options).number(decimals, true);
  const unitFormatter = prepareFormatter(amount, decimals).unitCode();

  return [valueFormatter.build().format(amount), unitFormatter.build().format(amount), approxZero];
}

export function formatAmountValue(amount: BigAmount, decimals = 9): string {
  const formatter = prepareFormatter(amount, decimals, { adjustUnit: false })
    .useTopUnit()
    .number(decimals, true, undefined, {
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
