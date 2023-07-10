import { BigAmount } from '@emeraldpay/bigamount';
import { EthereumAddress, formatAmount } from '@emeraldwallet/core';
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

export interface CommonAsset {
  address?: string;
  symbol: string;
}

interface Props {
  asset: string;
  assets: CommonAsset[];
  balance?: BigAmount;
  fiatBalance?: BigAmount;
  getAssetBalance(asset: string): BigAmount;
  onChangeAsset?(token: string): void;
}

export class SelectAsset extends React.Component<Props & WithStyles<typeof styles>> {
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
    const { asset, assets, balance, classes, fiatBalance, getAssetBalance } = this.props;

    return (
      <>
        <FormLabel>Token</FormLabel>
        <TextField
          select
          value={asset}
          onChange={this.onChangeToken}
          SelectProps={{ renderValue: () => this.onRenderValue(asset) }}
        >
          {assets?.map(({ address, symbol }) => {
            const key = address ?? symbol;
            const balance = getAssetBalance(key);

            if (balance.isZero()) {
              return undefined;
            }

            return (
              <MenuItem key={key} value={key}>
                <ListItemText primary={symbol} secondary={formatAmount(balance)} />
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
