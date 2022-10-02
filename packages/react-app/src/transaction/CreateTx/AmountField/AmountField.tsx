import { BigAmount, FormatterBuilder, Units } from '@emeraldpay/bigamount';
import { Input } from '@emeraldwallet/ui';
import { Button, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { Dispatch } from 'react';
import { connect } from 'react-redux';
import FormLabel from '../FormLabel';

interface Actions {
  onClear: () => void;
}

interface OwnProps {
  amount?: BigAmount | undefined;
  disabled?: boolean;
  units: Units;
  onChangeAmount: (amount: BigAmount) => void;
  onMaxClicked?: () => void;
}

const useStyles = makeStyles(
  createStyles({
    input: {
      width: '200px',
      marginRight: '10px',
    },
    button: {
      height: '30px',
      minWidth: '35px',
      fontSize: '11px',
    },
  }),
);

const formatOptions = {
  decimalSeparator: '.',
  groupSeparator: '',
};

function amountOrDefault(amount: BigAmount | undefined): string {
  return amount == null
    ? '0'
    : new FormatterBuilder().useTopUnit().number(6, true, undefined, formatOptions).build().format(amount);
}

const Component: React.FC<Actions & OwnProps> = ({
  disabled = false,
  amount,
  units,
  onChangeAmount,
  onClear,
  onMaxClicked,
}) => {
  const styles = useStyles();

  const [allowAmountUpdate, setAllowAmountUpdate] = React.useState(false);
  const [currentAmount, setCurrentAmount] = React.useState(amountOrDefault(amount));
  const [errorText, setErrorText] = React.useState('');

  const handleChangeAmount = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      let { value } = event.target;

      value = value.trim();

      setAllowAmountUpdate(false);
      setCurrentAmount(value);

      if (value === '') {
        setErrorText('Required');
        onClear();

        return;
      }

      const valid = value.match(/^\d*(\.\d+)?$/);

      if (!valid) {
        setErrorText('Invalid number');
        onClear();

        return;
      }

      try {
        const parsed = parseFloat(value);

        if (parsed < 0) {
          setErrorText('Value must be positive number');
          onClear();

          return;
        }

        const changedTo = new BigAmount(1, units)
          .multiply(units.top.multiplier) // relative to main unit. i.e. "20" should be "20 ether", not "20 wei"
          .multiply(parsed);

        setErrorText('');

        onChangeAmount(changedTo);
      } catch (exception) {
        console.error('Failed to parse amount:', exception);

        setErrorText('Invalid value');
        onClear();
      }
    },
    [units, onChangeAmount, onClear],
  );

  const handleMaxClick = React.useCallback(() => {
    onMaxClicked?.();

    setAllowAmountUpdate(true);
  }, [onMaxClicked]);

  React.useEffect(() => {
    if (allowAmountUpdate) {
      setCurrentAmount(amountOrDefault(amount));
    }
  }, [allowAmountUpdate, amount]);

  return (
    <React.Fragment>
      <FormLabel>Amount</FormLabel>
      <div className={styles.input}>
        <Input disabled={disabled} errorText={errorText} value={currentAmount} onChange={handleChangeAmount} />
      </div>
      <Button
        className={styles.button}
        color={allowAmountUpdate ? 'primary' : 'secondary'}
        disabled={disabled}
        onClick={handleMaxClick}
      >
        MAX
      </Button>
    </React.Fragment>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default connect(null, (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
  return {
    onClear: () => {
      ownProps.onChangeAmount(new BigAmount(0, ownProps.units));
    },
  };
})(Component);
