import { BigAmount } from '@emeraldpay/bigamount';
import { formatFiatAmountPartial } from '@emeraldwallet/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import entryStyles from '../styles';

const useStyles = makeStyles((theme) => entryStyles(theme));

interface OwnProps {
  balance: BigAmount;
}

const FiatBalance: React.FC<OwnProps> = ({ balance }) => {
  const styles = useStyles();

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
