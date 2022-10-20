import { BigAmount } from '@emeraldpay/bigamount';
import { formatAmount } from '@emeraldwallet/core';
import { ListItemText, MenuItem, StyleRules, TextField, Theme, createStyles } from '@material-ui/core';
import { WithStyles, withStyles } from '@material-ui/styles';
import * as React from 'react';
import { ReactElement } from 'react';
import FormLabel from '../FormLabel';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    balance: {
      color: theme.palette && theme.palette.text.secondary,
      wordSpacing: '3px',
      letterSpacing: '1px',
      fontWeight: 200,
      paddingLeft: '20px',
    },
  });

interface Props {
  balance?: BigAmount;
  fiatBalance?: string;
  fiatCurrency?: string;
  selectedToken: string;
  tokenSymbols: string[];
  getBalanceByToken(token: string): BigAmount;
  onChangeToken?(token: string): void;
}

export class TokenField extends React.Component<Props & WithStyles<typeof styles>> {
  public onChangeToken = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onChangeToken?.(value);
  };

  public render(): ReactElement {
    const { classes, selectedToken, balance, getBalanceByToken } = this.props;

    const tokenSymbols = this.props.tokenSymbols ?? [];

    return (
      <>
        <FormLabel>Token</FormLabel>
        <TextField
          select
          value={selectedToken}
          onChange={this.onChangeToken}
          SelectProps={{ renderValue: (value) => <>{value}</> }}
        >
          {tokenSymbols.map((symbol) => (
            <MenuItem key={symbol} value={symbol}>
              <ListItemText primary={symbol} secondary={formatAmount(getBalanceByToken(symbol))} />
            </MenuItem>
          ))}
        </TextField>
        <div className={classes.balance} data-testid="balance">
          {balance == null ? '?' : formatAmount(balance)}
          {` / ${this.props.fiatBalance} ${this.props.fiatCurrency}`}
        </div>
      </>
    );
  }
}

export default withStyles(styles)(TokenField);
