import {Input} from '@emeraldplatform/ui';
import * as React from 'react';
import FormLabel from '../FormLabel';
import {IState} from "@emeraldwallet/store";
import {BigAmount, Units} from "@emeraldpay/bigamount";
import {FormatterBuilder} from "@emeraldpay/bigamount";
import {makeStyles} from "@material-ui/core/styles";
import {Button, createStyles, Theme} from "@material-ui/core";
import {connect} from "react-redux";
import {Dispatch} from "react";
import {init} from "@emeraldwallet/store/lib/txhistory/actions";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    input: {
      width: '200px',
      marginRight: '10px'
    },
    button: {
      height: '30px',
      minWidth: '35px',
      fontSize: '11px'
    }
  })
);

function amountOrDefault(amount: BigAmount | undefined): string {
  if (typeof amount != "undefined" && amount != null) {
    return new FormatterBuilder()
      .useTopUnit()
      .number(6, true)
      .build()
      .format(amount)
  }
  return "0"
}

/**
 *
 */
const Component = (({onMaxClicked, onChangeAmount, onClear, units, initialAmount}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const [originalAmount, setOriginalAmount] = React.useState(initialAmount);
  const [amount, setAmount] = React.useState(amountOrDefault(initialAmount));
  const [errorText, setErrorText] = React.useState("");

  React.useEffect(() => {
    if (typeof originalAmount == "undefined"
      || (typeof initialAmount != "undefined" && initialAmount.isPositive() && !originalAmount.equals(initialAmount))) {
      // amount enforced from external source, ex. "MAX" button clicked and the amount was recalculated
      setOriginalAmount(initialAmount);
      setAmount(amountOrDefault(initialAmount));
    }
  });

  const handleChangeAmount = (event: any) => {
    let amountStr = event.target.value || '';
    setAmount(amountStr);
    amountStr = amountStr.trim();
    if (amountStr === '') {
      setErrorText("Required");
      onClear();
      return;
    }
    let valid = amountStr.match(/^\d*(\.\d+)?$/);
    if (!valid) {
      setErrorText("Invalid number");
      onClear();
      return;
    }
    try {
      const parsed = parseFloat(amountStr);
      if (parsed < 0) {
        setErrorText('Value must be positive number');
        onClear();
        return;
      }
      const changedTo = new BigAmount(1, units)
        .multiply(units.top.multiplier) // relative to main unit. i.e. "20" should be "20 ether", not "20 wei"
        .multiply(parsed)
      setErrorText("");

      onChangeAmount(changedTo);
    } catch (e) {
      console.error("failed to parse amount", e);
      setErrorText('Invalid value');
      onClear();
    }
  }

  return <React.Fragment>
    <FormLabel>Amount</FormLabel>
    <div className={styles.input}>
      <Input
        value={amount}
        onChange={handleChangeAmount}
        errorText={errorText}
      />
    </div>
    <Button
      className={styles.button}
      color={"primary"}
      onClick={onMaxClicked}>MAX</Button>
  </React.Fragment>
})

// State Properties
interface Props {
}

// Actions
interface Actions {
  onClear: () => void;
}

// Component properties
interface OwnProps {
  units: Units;
  initialAmount?: BigAmount | undefined;
  onChangeAmount: (amount: BigAmount) => void;
  onMaxClicked?: () => void;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      onClear: () => {
        ownProps.onChangeAmount(new BigAmount(0, ownProps.units))
      }
    }
  }
)((Component));