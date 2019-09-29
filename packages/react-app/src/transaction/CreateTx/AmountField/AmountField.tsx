import { toBaseUnits } from '@emeraldplatform/core';
import { Input } from '@emeraldplatform/ui';
import { IUnits, Units } from '@emeraldwallet/core';
import { Button } from '@emeraldwallet/ui';
import * as React from 'react';
import FormLabel from '../FormLabel';

interface IProps {
  onChangeAmount?: (amount: IUnits) => void;
  amount?: IUnits;
  tokenDecimals: number;
  // balance: Wei,
  onMaxClicked?: any;
}

interface IState {
  errorText: string | null;
  amountStr: string;
  original: IUnits;
}

class AmountField extends React.Component<IProps, IState> {

  public static getDerivedStateFromProps (props: IProps, state: IState) {
    const amount = props.amount || new Units(0, props.tokenDecimals);
    if (!state.original.equals(amount)) {
      return {
        errorText: null,
        original: amount,
        amountStr: amount.toString()
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
      amountStr: props.amount ? props.amount.toString() : '0',
      original: props.amount || new Units(0, props.tokenDecimals)
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
        this.setState({ errorText: 'value must be positive number' });
        return;
      }
      const v = toBaseUnits(parsed.toString(10), this.props.tokenDecimals);
      this.setState({ errorText: null });

      if (this.props.onChangeAmount) {
        this.props.onChangeAmount(new Units(v.toString(10), this.props.tokenDecimals));
      }
    } catch (e) {
      console.error(e);
      this.setState({ errorText: 'Invalid value' });
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
