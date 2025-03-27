import { BigAmount } from '@emeraldpay/bigamount';
import { CurrencyAmount, EthereumAddress, formatAmount, formatAmountPartial } from '@emeraldwallet/core';
import { ListItemText, MenuItem, TextField, Tooltip } from '@mui/material';
import type { Theme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
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
  fiatBalance?: CurrencyAmount;
  onChangeAsset?(asset: string): void;
}

const useStyles = makeStyles()((theme: Theme) => ({
  balance: {
    color: theme.palette.text.secondary,
    fontWeight: 200,
    letterSpacing: 1,
    paddingLeft: 20,
    wordSpacing: 3,
  },
  tooltip: { cursor: 'help' },
}));

export const SelectAsset: React.FC<Props> = ({ 
  asset, 
  assets, 
  balance, 
  disabled, 
  fiatBalance, 
  onChangeAsset 
}) => {
  const { classes } = useStyles();

  const handleAssetChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    onChangeAsset?.(value);
  };

  const renderAsset = (asset: string): string => {
    if (EthereumAddress.isValid(asset)) {
      return assets.find(({ address }) => address === asset)?.symbol ?? asset;
    }

    return asset;
  };

  const renderBalance = (): React.ReactNode => {
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

  return (
    <>
      <TextField
        select
        disabled={disabled}
        value={asset}
        onChange={handleAssetChange}
        SelectProps={{ renderValue: () => renderAsset(asset) }}
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
      {renderBalance()}
    </>
  );
};

export default SelectAsset;
