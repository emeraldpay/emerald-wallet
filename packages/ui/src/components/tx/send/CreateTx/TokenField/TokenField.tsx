import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';

import { Wei } from '@emeraldplatform/eth';
import FormLabel from '../FormLabel';

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

interface Props {
  onChangeToken?: any;
  selectedToken: string;
  tokenSymbols: string[];
  balance?: Wei;
  fiatBalance?: string;
  fiatCurrency?: string;
  classes?: any;
}

export class TokenField extends React.Component<Props> {
  public onChangeToken = (event: any) => {
    if (this.props.onChangeToken) {
      this.props.onChangeToken(event.target.value);
    }
  }

  public render () {
    const { classes, selectedToken } = this.props;
    const tokenSymbols = this.props.tokenSymbols || [];
    return (
      <React.Fragment>
        <FormLabel>Token</FormLabel>
        <TextField
          select={true}
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
