import { BigAmount } from '@emeraldpay/bigamount';
import { EthereumAddress, formatAmount, formatAmountPartial } from '@emeraldwallet/core';
import { ListItemText, MenuItem, StyleRulesCallback, TextField, Theme, Tooltip, createStyles } from '@material-ui/core';
import { WithStyles, withStyles } from '@material-ui/styles';
import * as React from 'react';

export interface CommonAsset {
  address?: string;
  symbol: string;
}

export interface Asset extends CommonAsset {
  balance: BigAmount;
}

interface Props {
  asset: string;
  assets: Asset[];
  balance?: BigAmount;
  disabled?: boolean;
  fiatBalance?: BigAmount;
  onChangeAsset?(token: string): void;
}

const styles: StyleRulesCallback<Theme, Props> = (theme) =>
  createStyles({
    balance: {
      color: theme.palette.text.secondary,
      fontWeight: 200,
      letterSpacing: 1,
      paddingLeft: 20,
      wordSpacing: 3,
    },
    tooltip: { cursor: 'help' },
  });

export class SelectAsset extends React.Component<Props & WithStyles<typeof styles>> {
  onChangeToken = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onChangeAsset?.(value);
  };

  renderAsset = (asset: string): string => {
    if (EthereumAddress.isValid(asset)) {
      return this.props.assets.find(({ address }) => address === asset)?.symbol ?? asset;
    }

    return asset;
  };

  renderBalance = (): React.ReactNode => {
    const { balance, classes, fiatBalance } = this.props;

    if (balance == null) {
      if (fiatBalance == null) {
        return null;
      }

      return formatAmount(fiatBalance);
    }

    const [balanceValue, balanceUnit, approxZero] = formatAmountPartial(balance);

    return (
      <div className={classes.balance} data-testid="balance">
        {approxZero ? (
          <Tooltip className={classes.tooltip} title={balance.toString()}>
            <span>{balanceValue}</span>
          </Tooltip>
        ) : (
          balanceValue
        )}{' '}
        {balanceUnit}
        {fiatBalance == null ? null : ` / ${formatAmount(fiatBalance)}`}
      </div>
    );
  };

  render(): React.ReactNode {
    const { asset, assets, disabled } = this.props;

    return (
      <>
        <TextField
          select
          disabled={disabled}
          value={asset}
          onChange={this.onChangeToken}
          SelectProps={{ renderValue: () => this.renderAsset(asset) }}
        >
          {assets.map(({ address, symbol, balance: assetBalance }) => {
            const key = address ?? symbol;

            return (
              <MenuItem key={key} value={key}>
                <ListItemText primary={symbol} secondary={formatAmount(assetBalance)} />
              </MenuItem>
            );
          })}
        </TextField>
        {this.renderBalance()}
      </>
    );
  }
}

export default withStyles(styles)(SelectAsset);
