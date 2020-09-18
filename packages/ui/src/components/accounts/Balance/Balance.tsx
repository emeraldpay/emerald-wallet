import {WithDefaults} from '@emeraldwallet/core';
import * as React from 'react';
import {createStyles, Typography} from "@material-ui/core";
import {ClassNameMap} from '@material-ui/styles';
import {makeStyles} from "@material-ui/core/styles";
import {BigAmount, Unit} from "@emeraldpay/bigamount";

const useStyles = makeStyles(
  createStyles({
    coins: {
      color: '#191919'
    },
    coinBalance: {},
    coinSymbol: {
      paddingLeft: "5px",
    },
    root: {},
  })
);

// Component properties
export interface OwnProps {
  balance?: BigAmount | undefined;
  classes?: Partial<ClassNameMap<ClassKey>>
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
      <Typography className={styles.coins + " " + classes?.coins}>
        <span className={styles.coinBalance + " " + classes?.coinBalance}>{coinsStr}</span>
        <span className={styles.coinSymbol + " " + classes?.coinSymbol}>{unit?.code}</span>
      </Typography>
    </div>
  );
})

export default Component;