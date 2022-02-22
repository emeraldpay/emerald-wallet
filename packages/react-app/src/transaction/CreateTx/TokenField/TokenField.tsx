import { BigAmount, FormatterBuilder, Predicates } from "@emeraldpay/bigamount";
import { createStyles, MenuItem, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';
import { ReactElement } from 'react';
import FormLabel from '../FormLabel';

interface Props {
  balance?: BigAmount;
  classes?: any;
  fiatBalance?: string;
  fiatCurrency?: string;
  selectedToken: string;
  tokenSymbols: string[];
  onChangeToken?: any;
}

const balanceFormatter = new FormatterBuilder()
  .when(Predicates.ZERO, (whenTrue: FormatterBuilder, whenFalse: FormatterBuilder): void => {
    whenTrue.useTopUnit();
    whenFalse.useOptimalUnit();
  })
  .number(3, true)
  .append(' ')
  .unitCode()
  .build();

const styles = (theme?: any): Record<string, any> => createStyles(
  {
    balance: {
      color: theme.palette && theme.palette.text.secondary,
      wordSpacing: '3px',
      letterSpacing: '1px',
      fontWeight: 200,
      paddingLeft: '20px',
    },
  },
)

export class TokenField extends React.Component<Props> {
  public onChangeToken = (event: any): void => {
    if (this.props.onChangeToken) {
      this.props.onChangeToken(event.target.value);
    }
  }

  public render(): ReactElement {
    const { classes, selectedToken, balance } = this.props;

    const tokenSymbols = this.props.tokenSymbols ?? [];

    return (
      <React.Fragment>
        <FormLabel>Token</FormLabel>
        <TextField
          select={true}
          value={selectedToken}
          onChange={this.onChangeToken}
        >
          {tokenSymbols.map((symbol) => (
            <MenuItem key={symbol} value={symbol}>{symbol}</MenuItem>
          ))}
        </TextField>
        <div className={classes.balance} data-testid="balance">
          {balance == null ? '?' : balanceFormatter.format(balance)}
          {` / ${this.props.fiatBalance} ${this.props.fiatCurrency}`}
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(TokenField);
