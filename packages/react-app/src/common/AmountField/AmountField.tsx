import { BigAmount, Units } from '@emeraldpay/bigamount';
import { formatAmountValue } from '@emeraldwallet/core';
import { Button, Input } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';

interface OwnProps {
  amount?: BigAmount;
  disabled?: boolean;
  maxAmount?: BigAmount;
  maxDisabled?: boolean;
  fieldWidth?: number;
  units: Units;
  onChangeAmount(value: BigAmount): void;
  onMaxClick(callback: (value: BigAmount) => void): void;
}

interface DispatchProps {
  onClear(): void;
}

const AmountField: React.FC<OwnProps & DispatchProps> = ({
  amount,
  maxAmount,
  units,
  disabled = false,
  maxDisabled = false,
  fieldWidth = 440,
  onChangeAmount,
  onClear,
  onMaxClick,
}) => {
  const changed = React.useRef(false);

  const [currentAmount, setCurrentAmount] = React.useState(amount == null ? '0' : formatAmountValue(amount));
  const [currentMaxAmount, setCurrentMaxAmount] = React.useState(
    maxAmount == null ? null : formatAmountValue(maxAmount),
  );

  const [errorText, setErrorText] = React.useState<string | null>(null);

  const handleAmountChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    const newAmount = value.trim();

    changed.current = true;

    setCurrentAmount(newAmount);

    if (newAmount === '') {
      setErrorText('Required');

      onClear();

      return;
    }

    const valid = newAmount.match(/^\d*(\.\d+)?$/);

    if (!valid) {
      setErrorText('Invalid number');

      onClear();

      return;
    }

    try {
      const parsed = parseFloat(newAmount);

      if (parsed < 0) {
        setErrorText('Value must be positive number');

        onClear();
      } else {
        setErrorText(null);

        // Relative to the main unit. I.e. "20" should be 20 Ether, not 20 Wei
        onChangeAmount(new BigAmount(1, units).multiply(units.top.multiplier).multiply(parsed));
      }
    } catch (exception) {
      setErrorText('Invalid value');

      onClear();
    }
  };

  const handleMaxClick = (): void => {
    onMaxClick((value) => {
      const newAmount = formatAmountValue(value);

      changed.current = true;

      setCurrentAmount(newAmount);
      setCurrentMaxAmount(newAmount);

      setErrorText(null);
    });
  };

  React.useEffect(() => {
    if (!changed.current && amount != null) {
      const newAmount = formatAmountValue(amount);

      if (newAmount !== currentAmount) {
        setCurrentAmount(newAmount);
      }
    }
  }, [amount, currentAmount]);

  return (
    <div style={{ width: fieldWidth }}>
      <Input
        disabled={disabled}
        errorText={errorText}
        rightIcon={
          <Button
            disabled={disabled || maxDisabled}
            label="Max"
            primary={currentAmount === currentMaxAmount}
            size="small"
            variant="text"
            onClick={handleMaxClick}
          />
        }
        value={currentAmount}
        onChange={handleAmountChange}
      />
    </div>
  );
};

export default connect<unknown, DispatchProps, OwnProps>(null, (dispatch, { units, onChangeAmount }) => ({
  onClear() {
    onChangeAmount(new BigAmount(0, units));
  },
}))(AmountField);
