import { CurrencyAmount, formatFiatAmountPartial } from '@emeraldwallet/core';
import { Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import entryStyles from '../styles';

const useStyles = makeStyles()(
  {
    ...entryStyles
  }
);

interface OwnProps {
  balance: CurrencyAmount;
}

const FiatBalance: React.FC<OwnProps> = ({ balance }) => {
  const { classes: styles } = useStyles();

  const [balanceValue, balanceUnit] = formatFiatAmountPartial(balance);

  return (
    <div className={styles.entryBalance}>
      <Typography className={styles.entryBalanceValue} variant="caption">
        {balanceValue}
      </Typography>
      <Typography variant="caption">{balanceUnit}</Typography>
    </div>
  );
};

export default FiatBalance;
