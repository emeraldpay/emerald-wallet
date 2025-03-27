import { BigAmount } from '@emeraldpay/bigamount';
import { formatAmountPartial } from '@emeraldwallet/core';
import { Tooltip, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import entryStyles from '../styles';

const useStyles = makeStyles()((theme) => ({
  ...entryStyles,
  tooltip: {
    cursor: 'help',
  },
}));

interface OwnProps {
  balance: BigAmount;
}

const Balance: React.FC<OwnProps> = ({ balance }) => {
  const { classes: styles } = useStyles();

  const [balanceValue, balanceUnit, approxZero] = formatAmountPartial(balance);

  return (
    <div className={styles.entryBalance}>
      <Typography className={styles.entryBalanceValue} color="textPrimary" variant="subtitle1">
        {approxZero ? (
          <Tooltip className={styles.tooltip} title={balance.toString()}>
            <span>{balanceValue}</span>
          </Tooltip>
        ) : (
          balanceValue
        )}
      </Typography>
      <Typography color="textPrimary" variant="subtitle1">
        {balanceUnit}
      </Typography>
    </div>
  );
};

export default Balance;
