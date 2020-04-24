import { fromBaseUnits } from '@emeraldplatform/core';
import { Wei } from '@emeraldplatform/eth';
import { Currency, CurrencyCode, Units } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import * as React from 'react';

const defaultStyles = {
  coins: {
    color: '#191919'
  },
  fiat: {
    color: '#191919'
  }
};

export interface IProps {
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
  coinsStyle?: any;
  fiatStyle?: any;
  displayDecimals?: number;
}

export class Balance extends React.Component<IProps> {
  public static defaultProps = {
    coinsStyle: defaultStyles.coins,
    fiatStyle: defaultStyles.fiat,
    showFiat: false
  };

  public render () {
    const {
      balance, showFiat, fiatCurrency, fiatRate, symbol, decimals, displayDecimals
    } = this.props;

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
    const { fiatStyle, coinsStyle } = this.props;

    return (
      <div>
        <span id='balance' style={coinsStyle}>
          {balance ? coinsStr : '-'} {symbol}
        </span>
        {fiatAmount && <br/>}
        {fiatAmount && <span id='fiat' style={fiatStyle}>{fiatAmount} {fiatCurrency}</span>}
      </div>
    );
  }
}

export default Balance;
