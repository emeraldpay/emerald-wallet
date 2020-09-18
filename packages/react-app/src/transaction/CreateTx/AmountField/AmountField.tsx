import {Input} from '@emeraldplatform/ui';
import {Button} from '@emeraldwallet/ui';
import * as React from 'react';
import FormLabel from '../FormLabel';
import {BigAmount} from "@emeraldpay/bigamount";
import {FormatterBuilder} from "@emeraldpay/bigamount/lib/formatter";

interface IProps {
  onChangeAmount?: (amount: BigAmount) => void;
  amount: BigAmount;
  onMaxClicked?: any;
}

interface IState {
  errorText: string | null;
  amountStr: string;
  original: BigAmount;
}

const AMOUNT_FMT = new FormatterBuilder()
  .useTopUnit()
  .number()
  .build();

class AmountField extends React.Component<IProps, IState> {

  public static getDerivedStateFromProps(props: IProps, state: IState) {
    const amount = props.amount;
    if (!state.original.equals(amount)) {
      return {
        errorText: null,
        original: amount,
        amountStr: AMOUNT_FMT.format(amount)
      };
    }
    return null;
  }

  public inputStyles = {
    width: '200px',
    marginRight: '10px'
  };

  public buttonStyles = {
    height: '30px',
    minWidth: '35px',
    fontSize: '11px'
  };

  constructor (props: IProps) {
    super(props);
    this.state = {
      errorText: null,
      amountStr: AMOUNT_FMT.format(props.amount),
      original: props.amount
    };
  }

  public handleChangeAmount = (event: any) => {
    let amount = event.target.value || '';
    this.setState({ amountStr: amount });
    amount = amount.trim();
    if (amount === '') {
      this.setState({ errorText: 'Required' });
      return;
    }
    try {
      const parsed = parseFloat(amount);
      if (parsed < 0) {
        this.setState({errorText: 'value must be positive number'});
        return;
      }
      const units = this.state.original.units;
      const changedTo = new BigAmount(1, units)
        .multiply(units.top.multiplier) // relative to main unit. i.e. "20" should men "20 ether", not "20 wei"
        .multiply(parsed)
      this.setState({errorText: null});

      if (this.props.onChangeAmount) {
        this.props.onChangeAmount(changedTo);
      }
    } catch (e) {
      console.error("failed to parse amount", e);
      this.setState({errorText: 'Invalid value'});
    }
  }

  public render () {
    const { errorText, amountStr } = this.state;
    return (
      <React.Fragment>
        <FormLabel>Amount</FormLabel>
        <div style={this.inputStyles}>
          <Input
            type='number'
            // containerStyle={this.inputStyles}
            // min="0"
            // max={this.props.balance}
            value={amountStr}
            onChange={this.handleChangeAmount}
            errorText={errorText}
          />
        </div>
        <Button
          style={this.buttonStyles}
          primary={true}
          label='MAX'
          onClick={this.props.onMaxClicked}
        />
      </React.Fragment>
    );
  }
}

export default AmountField;
