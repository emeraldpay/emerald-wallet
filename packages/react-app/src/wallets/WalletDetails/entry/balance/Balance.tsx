import { BigAmount } from '@emeraldpay/bigamount';
import { formatAmountPartial } from '@emeraldwallet/core';
import { Tooltip, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import entryStyles from '../styles';

const useStyles = makeStyles((theme) => ({
  ...entryStyles(theme),
  tooltip: {
    cursor: 'help',
  },
}));

interface OwnProps {
  balance: BigAmount;
}

const Balance: React.FC<OwnProps> = ({ balance }) => {
  const styles = useStyles();

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
