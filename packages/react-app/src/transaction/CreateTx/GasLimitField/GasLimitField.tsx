import { Wei } from '@emeraldpay/bigamount-crypto';
import { Input } from '@emeraldwallet/ui';
import { StyleRules, Theme, WithStyles, createStyles, withStyles } from '@material-ui/core';
import * as React from 'react';
import FormLabel from '../../../form/FormLabel';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    container: {
      color: theme.palette && theme.palette.text.secondary,
      fontSize: 14,
      fontWeight: 200,
      letterSpacing: 1,
      paddingLeft: 20,
      wordSpacing: 3,
    },
  });

interface OwnProps {
  fiatCurrency?: string;
  gasLimit: string;
  txFee: Wei;
  txFeeFiat?: string;
  txFeeToken: string;
  onChangeGasLimit?: (value: string) => void;
}

type Props = OwnProps & WithStyles<typeof styles>;

export class GasLimitField extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.onChangeGasLimit = this.onChangeGasLimit.bind(this);
  }

  onChangeGasLimit(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void {
    if (this.props.onChangeGasLimit) {
      this.props.onChangeGasLimit(event.target.value);
    }
  }

  render(): React.ReactNode {
    const { classes, txFee, txFeeToken } = this.props;

    return (
      <React.Fragment>
        <FormLabel>Gas Limit</FormLabel>
        <div style={{ width: '200px' }}>
          <Input type="number" value={this.props.gasLimit} onChange={this.onChangeGasLimit} />
        </div>
        <div className={classes.container}>
          {txFee.toString()} {txFeeToken} / {this.props.txFeeFiat} {this.props.fiatCurrency}
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(GasLimitField);
