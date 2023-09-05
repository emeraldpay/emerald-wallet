import { BigAmount } from '@emeraldpay/bigamount';
import { EthereumAddress, formatAmount } from '@emeraldwallet/core';
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

export interface CommonAsset {
  address?: string;
  symbol: string;
}

export interface Asset extends CommonAsset {
  balance: BigAmount;
}

interface OwnProps {
  asset: string;
  assets: Asset[];
  balance?: BigAmount;
  disabled?: boolean;
  fiatBalance?: BigAmount;
  onChangeAsset?(token: string): void;
}

export class SelectAsset extends React.Component<OwnProps & WithStyles<typeof styles>> {
  onChangeToken = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onChangeAsset?.(value);
  };

  onRenderValue = (value: string): string => {
    if (EthereumAddress.isValid(value)) {
      return this.props.assets.find(({ address }) => address === value)?.symbol ?? value;
    }

    return value;
  };

  public render(): ReactElement {
    const { asset, assets, balance, classes, disabled, fiatBalance } = this.props;

    return (
      <>
        <TextField
          select
          disabled={disabled}
          value={asset}
          onChange={this.onChangeToken}
          SelectProps={{ renderValue: () => this.onRenderValue(asset) }}
        >
          {assets?.map(({ address, symbol, balance: assetBalance }) => {
            const key = address ?? symbol;

            return (
              <MenuItem key={key} value={key}>
                <ListItemText primary={symbol} secondary={formatAmount(assetBalance)} />
              </MenuItem>
            );
          })}
        </TextField>
        <div className={classes.balance} data-testid="balance">
          {balance == null ? null : formatAmount(balance)}
          {fiatBalance == null ? null : `${balance == null ? '' : ' /'} ${formatAmount(fiatBalance)}`}
        </div>
      </>
    );
  }
}

export default withStyles(styles)(SelectAsset);
