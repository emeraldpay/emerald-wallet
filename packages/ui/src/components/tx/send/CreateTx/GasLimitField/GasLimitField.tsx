import * as React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {Input} from '@emeraldplatform/ui';

import FormLabel from '../FormLabel';

function getStyles(theme?: any) {
  return {
    container: {
      color: theme.palette.text.secondary,
      wordSpacing: '3px',
      letterSpacing: '1px',
      fontWeight: 200,
      paddingLeft: '20px',
      fontSize: '14px',
    }
  };
}

interface Props {
  onChangeGasLimit?: any;
  txFee: string;
  txFeeToken: string;
  gasLimit: string;
  txFeeFiat?: string;
  fiatCurrency?: string;
  classes?: any;
}

export class GasLimitField extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.onChangeGasLimit = this.onChangeGasLimit.bind(this);
  }

  onChangeGasLimit(event: any) {
    this.props.onChangeGasLimit(event.target.value);
  }

  render() {
    const { txFeeToken, txFee } = this.props;
    return (
      <React.Fragment>
        <FormLabel>Gas Limit</FormLabel>
        <div style={{width: "200px"}}>
          <Input
            type="number"
            value={this.props.gasLimit}
            // min="21000"
            onChange={this.onChangeGasLimit}
          />
        </div>
        <div className={this.props.classes.container}>
          {txFee} {txFeeToken} / {this.props.txFeeFiat} {this.props.fiatCurrency}
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(getStyles)(GasLimitField);
