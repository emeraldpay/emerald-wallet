import * as React from 'react';
import {Input} from '@emeraldplatform/ui';
import Button from '../../../../common/Button';
import FormLabel from '../FormLabel';

interface Props {
  onChangeAmount?: any;
  amount: string;
  balance: string,
  onMaxClicked?: any;
}

interface State {
  errorText: string | null;
}

class AmountField extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      errorText: null,
    };
  }

  handleChangeAmount = (event: any) => {
    const amount = event.target.value;
    if (this.props.onChangeAmount) {
      this.props.onChangeAmount(amount);
    }

    if (!amount && amount !== 0) {
      this.setState({errorText: 'Required'});
    } else {
      this.setState({errorText: null});
    }
  };

  inputStyles = {
    width: '200px',
    marginRight: '10px',
  };

  buttonStyles = {
    height: '30px',
    minWidth: '35px',
    fontSize: '11px',
  };

  render() {
    const { errorText } = this.state;
    return (
      <React.Fragment>
        <FormLabel>Amount</FormLabel>
        <div style={this.inputStyles}>
          <Input
            type="number"
            // containerStyle={this.inputStyles}
            // min="0"
            // max={this.props.balance}
            value={this.props.amount}
            onChange={this.handleChangeAmount}
            errorText={errorText}
          />
        </div>
        <Button
          style={this.buttonStyles}
          primary
          label="MAX"
          onClick={this.props.onMaxClicked}
        />
      </React.Fragment>
    );
  }
}

export default AmountField;
