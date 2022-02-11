import { BigAmount, Unit } from "@emeraldpay/bigamount";
import { WithDefaults } from '@emeraldwallet/core';
import { createStyles, IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Sync } from '@material-ui/icons';
import { ClassNameMap } from '@material-ui/styles';
import * as React from 'react';

const useStyles = makeStyles(
  createStyles({
    coins: {
      color: '#191919'
    },
    coinBalance: {},
    coinSymbol: {
      paddingLeft: "5px",
    },
    root: {
      minHeight: '28px',
    },
    convert: {
      marginRight: '5px',
    }
  })
);

// Component properties
export interface OwnProps {
  balance?: BigAmount | undefined;
  classes?: Partial<ClassNameMap<ClassKey>>;
  onConvert?: () => void;
}

type ClassKey = 'coins' | 'coinBalance' | 'coinSymbol' | 'root' ;

const defaults: Partial<OwnProps> = {
  classes: {},
}

/**
 *
 */
const Component = ((props: OwnProps) => {
  props = WithDefaults(props, defaults);
  const {
    balance, classes
  } = props;
  const styles = useStyles();

  let coinsStr = "-";
  let unit: Unit = null;
  if (BigAmount.is(balance)) {
    unit = balance.getOptimalUnit();
    coinsStr = balance.getNumberByUnit(unit).toFixed(3)
  }

  return (
    <div className={styles.root + " " + classes?.root}>
      {props.onConvert != null && (
        <IconButton className={styles.convert} size="small" title="Convert to token" onClick={props.onConvert}>
          <Sync color="primary" fontSize="small" />
        </IconButton>
      )}
      <Typography className={styles.coins + " " + classes?.coins}>
        <span className={styles.coinBalance + " " + classes?.coinBalance}>{coinsStr}</span>
        <span className={styles.coinSymbol + " " + classes?.coinSymbol}>{unit?.code}</span>
      </Typography>
    </div>
  );
})

export default Component;
