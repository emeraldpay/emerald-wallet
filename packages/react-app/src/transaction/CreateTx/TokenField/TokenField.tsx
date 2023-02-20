import { BigAmount } from '@emeraldpay/bigamount';
import { formatAmount } from '@emeraldwallet/core';
import { FormLabel } from '@emeraldwallet/ui';
import { ListItemText, MenuItem, StyleRules, TextField, Theme, createStyles } from '@material-ui/core';
import { WithStyles, withStyles } from '@material-ui/styles';
import * as React from 'react';
import { ReactElement } from 'react';

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
  fiatBalance?: string | null;
  fiatCurrency?: string;
  selectedToken: string;
  tokenSymbols: string[];
  getBalanceByToken(token: string): BigAmount;
  onChangeToken?(token: string): void;
}

export class TokenField extends React.Component<Props & WithStyles<typeof styles>> {
  onChangeToken = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onChangeToken?.(value);
  };

  onRenderValue<T>(value: T): T {
    return value;
  }

  public render(): ReactElement {
    const { balance, classes, fiatBalance, fiatCurrency, selectedToken, tokenSymbols, getBalanceByToken } = this.props;

    return (
      <>
        <FormLabel>Token</FormLabel>
        <TextField
          select
          value={selectedToken}
          onChange={this.onChangeToken}
          SelectProps={{ renderValue: this.onRenderValue }}
        >
          {tokenSymbols?.map((symbol) => (
            <MenuItem key={symbol} value={symbol}>
              <ListItemText primary={symbol} secondary={formatAmount(getBalanceByToken(symbol))} />
            </MenuItem>
          ))}
        </TextField>
        <div className={classes.balance} data-testid="balance">
          {balance == null ? null : formatAmount(balance)}
          {fiatBalance == null || fiatCurrency == null ? null : ` / ${fiatBalance} ${fiatCurrency}`}
        </div>
      </>
    );
  }
}

export default withStyles(styles)(TokenField);
