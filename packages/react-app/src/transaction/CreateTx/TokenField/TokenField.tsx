import { MenuItem, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';
import FormLabel from '../FormLabel';
import {BigAmount} from "@emeraldpay/bigamount";

function getStyles (theme?: any) {
  return {
    balance: {
      color: theme.palette && theme.palette.text.secondary,
      wordSpacing: '3px',
      letterSpacing: '1px',
      fontWeight: 200,
      paddingLeft: '20px'
    }
  };
}

interface IProps {
  onChangeToken?: any;
  selectedToken: string;
  tokenSymbols: string[];
  balance?: BigAmount;
  fiatBalance?: string;
  fiatCurrency?: string;
  classes?: any;
}

export class TokenField extends React.Component<IProps> {
  public onChangeToken = (event: any) => {
    if (this.props.onChangeToken) {
      this.props.onChangeToken(event.target.value);
    }
  }

  public render () {
    const { classes, selectedToken, balance } = this.props;
    const tokenSymbols = this.props.tokenSymbols || [];
    return (
      <React.Fragment>
        <FormLabel>Token</FormLabel>
        <TextField
          select={true}
          value={selectedToken}
          onChange={this.onChangeToken}
        >
          {tokenSymbols.map((symbol) => (<MenuItem key={symbol} value={symbol}>{symbol}</MenuItem>))}
        </TextField>

        <div className={classes.balance} data-testid='balance'>
          {this.renderBalance(balance)} {this.props.selectedToken} / {this.props.fiatBalance} {this.props.fiatCurrency}
        </div>
      </React.Fragment>
    );
  }

  private renderBalance(balance?: BigAmount) {
    return (
      <React.Fragment>
        {balance ? balance.toString() : '?'}
      </React.Fragment>
    );
  }
}

export default withStyles(getStyles)(TokenField);
