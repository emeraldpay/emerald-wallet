import { BigAmount } from '@emeraldpay/bigamount';
import { formatAmountPartial } from '@emeraldwallet/core';
import { IconButton, Tooltip, Typography, createStyles, makeStyles } from '@material-ui/core';
import { Sync } from '@material-ui/icons';
import { ClassNameMap } from '@material-ui/styles';
import classNames from 'classnames';
import * as React from 'react';

export interface OwnProps {
  balance: BigAmount;
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
    tooltip: {
      cursor: 'help',
    },
  }),
);

const Balance: React.FC<OwnProps> = ({ balance, classes = {}, decimals = 3, onConvert }) => {
  const styles = useStyles();

  const [balanceValue, balanceUnit, approxZero] = formatAmountPartial(balance, decimals);

  const renderBalanceValue = (): React.ReactElement => <span className={classes?.coinBalance}>{balanceValue}</span>;

  return (
    <div className={`${styles.root} ${classes?.root}`}>
      {onConvert != null && (
        <IconButton className={styles.convert} size="small" title="Convert to token" onClick={onConvert}>
          <Sync color="primary" fontSize="small" />
        </IconButton>
      )}
      <Typography className={classNames(styles.coin, classes?.coin)}>
        {approxZero ? (
          <Tooltip className={styles.tooltip} title={balance.toString()}>
            {renderBalanceValue()}
          </Tooltip>
        ) : (
          renderBalanceValue()
        )}
        <span className={classNames(styles.coinSymbol, classes?.coinSymbol)}>{balanceUnit}</span>
      </Typography>
    </div>
  );
};

export default Balance;
