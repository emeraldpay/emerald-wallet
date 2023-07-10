import { BigAmount, FormatterBuilder, Predicates } from '@emeraldpay/bigamount';
import { getStandardUnits } from '@emeraldwallet/core';
import { IconButton, Typography, createStyles, makeStyles } from '@material-ui/core';
import { Sync } from '@material-ui/icons';
import { ClassNameMap } from '@material-ui/styles';
import classNames from 'classnames';
import * as React from 'react';

export interface OwnProps {
  balance?: BigAmount;
  classes?: Partial<ClassNameMap<'root' | 'coin' | 'coinBalance' | 'coinSymbol'>>;
  decimals?: number;
  onConvert?(): void;
}

const useStyles = makeStyles(
  createStyles({
    root: {
      minHeight: 28,
    },
    convert: {
      marginRight: 5,
    },
    coin: {
      color: '#191919',
    },
    coinSymbol: {
      paddingLeft: 5,
    },
  }),
);

const Balance: React.FC<OwnProps> = ({ balance, classes = {}, decimals = 3, onConvert }) => {
  const styles = useStyles();

  const formatBalance = React.useCallback(
    (balance: BigAmount) => {
      const units = getStandardUnits(balance);

      const formatSelector = (whenTrue: FormatterBuilder, whenFalse: FormatterBuilder): void => {
        whenTrue.useTopUnit();
        whenFalse.useOptimalUnit(undefined, units, 3);
      };

      const coinFormatter = new FormatterBuilder().when(Predicates.ZERO, formatSelector).number(decimals, true).build();
      const unitFormatter = new FormatterBuilder().when(Predicates.ZERO, formatSelector).unitCode().build();

      return [coinFormatter.format(balance), unitFormatter.format(balance)];
    },
    [decimals],
  );

  const [coinBalance, balanceUnit] = formatBalance(balance);

  return (
    <div className={`${styles.root} ${classes?.root}`}>
      {onConvert != null && (
        <IconButton className={styles.convert} size="small" title="Convert to token" onClick={onConvert}>
          <Sync color="primary" fontSize="small" />
        </IconButton>
      )}
      <Typography className={classNames(styles.coin, classes?.coin)}>
        <span className={classes?.coinBalance}>{balance == null ? '-' : coinBalance}</span>
        <span className={classNames(styles.coinSymbol, classes?.coinSymbol)}>{balance == null ? '' : balanceUnit}</span>
      </Typography>
    </div>
  );
};

export default Balance;
