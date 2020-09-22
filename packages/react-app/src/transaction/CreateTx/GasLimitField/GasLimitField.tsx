import { Input } from '@emeraldplatform/ui';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';
import FormLabel from '../FormLabel';
import {Wei} from '@emeraldpay/bigamount-crypto';

function getStyles (theme?: any) {
  return {
    container: {
      color: theme.palette && theme.palette.text.secondary,
      wordSpacing: '3px',
      letterSpacing: '1px',
      fontWeight: 200,
      paddingLeft: '20px',
      fontSize: '14px'
    }
  };
}

interface IProps {
  onChangeGasLimit?: Function;
  txFee: Wei;
  txFeeToken: string;
  gasLimit: string;
  txFeeFiat?: string;
  fiatCurrency?: string;
  classes?: any;
}

export class GasLimitField extends React.Component<IProps> {
  constructor (props: IProps) {
    super(props);
    this.onChangeGasLimit = this.onChangeGasLimit.bind(this);
  }

  public onChangeGasLimit (event: any) {
    if (this.props.onChangeGasLimit) {
      this.props.onChangeGasLimit(event.target.value);
    }
  }

  public render () {
    const { txFeeToken, txFee } = this.props;
    return (
      <React.Fragment>
        <FormLabel>Gas Limit</FormLabel>
        <div style={{width: '200px'}}>
          <Input
            type='number'
            value={this.props.gasLimit}
            // min="21000"
            onChange={this.onChangeGasLimit}
          />
        </div>
        <div className={this.props.classes.container}>
          {txFee.toString()} {txFeeToken} / {this.props.txFeeFiat} {this.props.fiatCurrency}
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(getStyles)(GasLimitField);
