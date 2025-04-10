import { BigAmount } from '@emeraldpay/bigamount';
import { CurrencyAmount, formatAmountPartial, formatFiatAmountPartial } from '@emeraldwallet/core';
import { Tooltip, Typography, } from '@mui/material';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
    container: {
      columnGap: theme.spacing(),
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
    },
    tooltip: {
      cursor: 'help',
    },
    value: {
      textAlign: 'right',
    },
  }
));

interface OwnProps {
  amount: BigAmount;
  fiatAmount: CurrencyAmount;
  maxDisplay?: BigNumber;
}

export const Amount: React.FC<OwnProps> = ({ amount, fiatAmount, maxDisplay }) => {
  const styles = useStyles().classes;

  const [amountValue, amountUnit, approxZero] = formatAmountPartial(amount, 6);
  const [fiatAmountValue, fiatAmountUnit] = formatFiatAmountPartial(fiatAmount);

  const isShowInfinite = maxDisplay?.isLessThan(amount.number) ?? false;

  return (
    <div className={styles.container}>
      <Typography className={styles.value} color="textPrimary" variant="subtitle1">
        {approxZero || isShowInfinite ? (
          <Tooltip className={styles.tooltip} title={amount.toString()}>
            <span>{isShowInfinite ? <>&infin;</> : amountValue}</span>
          </Tooltip>
        ) : (
          amountValue
        )}
      </Typography>
      <Typography color="textPrimary" variant="subtitle1">
        {amountUnit}
      </Typography>
      {fiatAmount.isPositive() && (
        <>
          <Typography className={styles.value} variant="caption">
            {isShowInfinite ? (
              <Tooltip className={styles.tooltip} title={fiatAmount.toString()}>
                <span>&infin;</span>
              </Tooltip>
            ) : (
              fiatAmountValue
            )}
          </Typography>
          <Typography variant="caption">{fiatAmountUnit}</Typography>
        </>
      )}
    </div>
  );
};
