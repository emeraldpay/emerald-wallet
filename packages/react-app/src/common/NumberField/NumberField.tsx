import { Input } from '@emeraldwallet/ui';
import BigNumber from 'bignumber.js';
import * as React from 'react';

interface OwnProps {
  decimals?: number;
  disabled?: boolean;
  initialValue?: BigNumber;
  rightIcon?: React.ReactElement;
  value?: BigNumber;
  width?: number;
  onChange(value: BigNumber): void;
}

const NumberField: React.FC<OwnProps> = ({
  initialValue,
  rightIcon,
  value,
  decimals = 9,
  disabled = false,
  width = 440,
  onChange,
}) => {
  const [currentValue, setCurrentValue] = React.useState(initialValue?.decimalPlaces(decimals).toString());

  const [errorText, setErrorText] = React.useState<string | undefined>();

  const handleValueChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = value.replace(',', '.').trim();

    setCurrentValue(newValue);

    const zeroValue = new BigNumber(0);

    if (newValue.length === 0) {
      setErrorText('Required');

      onChange(zeroValue);
    } else {
      const valid = newValue.match(/^\d*(\.\d+)?$/);

      if (valid) {
        try {
          const parsed = parseFloat(newValue);

          if (parsed < 0) {
            setErrorText('Value must be positive number');

            onChange(zeroValue);
          } else {
            setErrorText(undefined);

            onChange(new BigNumber(newValue));
          }
        } catch (exception) {
          setErrorText('Invalid value');

          onChange(zeroValue);
        }
      } else {
        setErrorText('Invalid number');

        onChange(zeroValue);
      }
    }
  };

  React.useEffect(() => {
    if (value != null) {
      setCurrentValue(value.decimalPlaces(decimals).toString());
      setErrorText(undefined);
    }
  }, [decimals, value]);

  return (
    <div style={{ width }}>
      <Input
        disabled={disabled}
        errorText={errorText}
        rightIcon={rightIcon}
        value={currentValue}
        onChange={handleValueChange}
      />
    </div>
  );
};

export default NumberField;
