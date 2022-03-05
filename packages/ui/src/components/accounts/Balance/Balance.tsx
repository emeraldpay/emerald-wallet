import { BigAmount, FormatterBuilder, Predicates, Unit } from '@emeraldpay/bigamount';
import { Satoshi, Wei, WEIS, WEIS_ETC } from '@emeraldpay/bigamount-crypto';
import { createStyles, IconButton, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Sync } from '@material-ui/icons';
import { ClassNameMap } from '@material-ui/styles';
import * as React from 'react';

const styles = createStyles({
  coins: {
    color: '#191919',
  },
  coinBalance: {},
  coinSymbol: {
    paddingLeft: '5px',
  },
  root: {
    minHeight: '28px',
  },
  convert: {
    marginRight: '5px',
  },
});

export interface OwnProps {
  balance?: BigAmount | undefined;
  classes?: Partial<ClassNameMap<keyof typeof styles>>;
  onConvert?: () => void;
}

const useStyles = makeStyles(styles);

const Component: React.FC<OwnProps> = ({ balance, classes = {}, onConvert }) => {
  const styles = useStyles();

  const formatBalance = React.useCallback((balance: BigAmount) => {
    const units = Satoshi.is(balance)
      ? [WEIS_ETC.units[0], WEIS_ETC.units[3], WEIS_ETC.units[5], WEIS_ETC.units[6]]
      : Wei.is(balance)
      ? [WEIS.units[0], WEIS.units[3], WEIS.units[5], WEIS.units[6]]
      : undefined;

    const formatSelector = (whenTrue: FormatterBuilder, whenFalse: FormatterBuilder): void => {
      whenTrue.useTopUnit();
      whenFalse.useOptimalUnit(undefined, units, 3);
    };

    const coinFormatter = new FormatterBuilder().when(Predicates.ZERO, formatSelector).number(3, true).build();
    const unitFormatter = new FormatterBuilder().when(Predicates.ZERO, formatSelector).unitCode().build();

    return [coinFormatter.format(balance), unitFormatter.format(balance)];
  }, []);

  const [coinBalance, balanceUnit] = formatBalance(balance);

  return (
    <div className={`${styles.root} ${classes?.root}`}>
      {onConvert != null && (
        <IconButton className={styles.convert} size="small" title="Convert to token" onClick={onConvert}>
          <Sync color="primary" fontSize="small" />
        </IconButton>
      )}
      <Typography className={`${styles.coins} ${classes?.coins}`}>
        <span className={`${styles.coinBalance} ${classes?.coinBalance}`}>{balance == null ? '-' : coinBalance}</span>
        <span className={`${styles.coinSymbol} ${classes?.coinSymbol}`}>{balance == null ? '' : balanceUnit}</span>
      </Typography>
    </div>
  );
};

export default Component;
