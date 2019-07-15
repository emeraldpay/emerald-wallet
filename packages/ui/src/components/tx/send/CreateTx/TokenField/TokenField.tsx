import * as React from 'react';
import { withStyles } from '@material-ui/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

import FormLabel from '../FormLabel';
import {Wei} from "@emeraldplatform/eth";

function getStyles(theme?: any) {
  return {
    balance: {
      color: theme.palette && theme.palette.text.secondary,
      wordSpacing: '3px',
      letterSpacing: '1px',
      fontWeight: 200,
      paddingLeft: '20px',
    }
  };
}

interface Props {
  onChangeToken?: any;
  selectedToken: string;
  tokenSymbols: Array<string>;
  balance?: Wei;
  fiatBalance?: string;
  fiatCurrency?: string;
  classes?: any;
}

export class TokenField extends React.Component<Props> {
  onChangeToken = (event: any) => {
    if (this.props.onChangeToken) {
      this.props.onChangeToken(event.target.value);
    }
  };

  render() {
    const {classes, selectedToken} = this.props;
    const tokenSymbols = this.props.tokenSymbols || [];
    return (
      <React.Fragment>
        <FormLabel>Token</FormLabel>
        <TextField
          select
          value={selectedToken}
          onChange={this.onChangeToken}
          disabled={true}
        >
          {tokenSymbols.map((symbol) => <MenuItem
            key={symbol}
            value={symbol}
          >{symbol}</MenuItem>)}
        </TextField>

        <div className={classes.balance}>
          {this.props.balance ? this.props.balance.toString() : '?'} {this.props.selectedToken} / {this.props.fiatBalance} {this.props.fiatCurrency}
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(getStyles)(TokenField);
