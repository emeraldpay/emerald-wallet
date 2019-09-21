import { Units, Wei } from '@emeraldplatform/eth';
import { Input } from '@emeraldplatform/ui';
import * as React from 'react';
import Button from '../../../../common/Button';
import FormLabel from '../FormLabel';

interface Props {
  onChangeAmount?: Function;
  amount?: Wei;
  // balance: Wei,
  onMaxClicked?: any;
}

interface State {
  errorText: string | null;
  amountStr: string;
  original: Wei;
}

class AmountField extends React.Component<Props, State> {

  public static getDerivedStateFromProps (props: Props, state: State) {
    const amount = props.amount || Wei.ZERO;
    if (!state.original.equals(amount)) {
      return {
        errorText: null,
        original: amount,
        amountStr: amount.toString(Units.ETHER, 6, false, false)
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
  constructor (props: Props) {
    super(props);
    this.state = {
      errorText: null,
      amountStr: props.amount ? props.amount.toString(Units.ETHER, 6, false, false) : '0',
      original: props.amount || Wei.ZERO
    };
  }

  public handleChangeAmount = (event: any) => {
    let amount = event.target.value || '';
    this.setState({ amountStr: amount });
    amount = amount.trim();
    if (amount == '') {
      this.setState({ errorText: 'Required' });
      return;
    }
    try {
      const parsed = parseFloat(amount);
      if (parsed < 0) {
        this.setState({ errorText: 'value must be positive number' });
        return;
      }
      const wei = new Wei(parsed, Units.ETHER);
      this.setState({ errorText: null });

      if (this.props.onChangeAmount) {
        this.props.onChangeAmount(wei);
      }
    } catch (e) {
      this.setState({ errorText: 'Invalid value' });
    }
  }

  public render () {
    const { errorText, amountStr } = this.state;
    const { amount } = this.props;
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
