import {fromBaseUnits} from '@emeraldplatform/core';
import {Wei} from '@emeraldplatform/eth';
import {Currency, CurrencyCode, Units, WithDefaults} from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import {createStyles, Typography} from "@material-ui/core";
import {ClassNameMap} from '@material-ui/styles';
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(
  createStyles({
    coins: {
      color: '#191919'
    },
    coinBalance: {},
    coinSymbol: {
      paddingLeft: "5px",
    },
    fiat: {
      color: '#191919'
    },
    root: {},
  })
);

// Component properties
export interface OwnProps {
  symbol: string;

  /**
   * Base units (wei, satoshi, etc)
   */
  balance: Wei | BigNumber | Units | string;

  /**
   * Decimals (8 for Bitcoin, 18 for Ethereum), required only if balance is string or BigNumber
   */
  decimals?: number;
  fiatRate?: number | null;
  fiatCurrency?: string;
  showFiat?: boolean;
  displayDecimals?: number;
  classes?: Partial<ClassNameMap<ClassKey>>
}

type ClassKey = 'coins' | 'coinBalance' | 'coinSymbol' | 'fiat' | 'root' ;

const defaults: Partial<OwnProps> = {
  classes: {},
  showFiat: false
}

/**
 *
 */
const Component = ((props: OwnProps) => {
  props = WithDefaults(props, defaults);
  const {
    balance, showFiat, fiatCurrency, fiatRate, symbol, decimals, displayDecimals, classes
  } = props;
  const styles = useStyles();

  let fiatAmount = null;
  let coinsStr = null;
  let coins;
  if (typeof balance === 'string') {
    coins = fromBaseUnits(new BigNumber(balance), decimals);
    if (showFiat && fiatRate && fiatCurrency) {
      fiatAmount = Currency.format(
        Number(Currency.convert(coins.toString(), fiatRate)),
        fiatCurrency as CurrencyCode);
    }
  } else if (typeof balance === 'object') {
    let value: BigNumber;
    let valueDecimals: number;
    if (BigNumber.isBigNumber(balance)) {
      value = balance;
      valueDecimals = decimals;
    } else if (Units.isUnits(balance)) {
      value = balance.toBigNumber();
      valueDecimals = balance.decimals;
    } else {
      // Wei
      value = balance.toWei();
      valueDecimals = 18;
    }
    coins = value.dividedBy(new BigNumber(10).pow(valueDecimals));
  }
  coinsStr = coins.toFormat(displayDecimals || decimals);

  return (
    <div className={styles.root + " " + classes?.root}>
      <Typography className={styles.coins + " " + classes?.coins}>
        <span className={styles.coinBalance + " " + classes?.coinBalance}>{balance ? coinsStr : '-'}</span>
        <span className={styles.coinSymbol + " " + classes?.coinSymbol}>{symbol}</span>
      </Typography>
      {fiatAmount && <br/>}
      {fiatAmount && <Typography className={styles.fiat + " " + classes?.fiat}>{fiatAmount} {fiatCurrency}</Typography>}
    </div>
  );
})

export default Component;