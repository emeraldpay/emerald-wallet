import { fromBaseUnits } from '@emeraldplatform/core';
import { Wei } from '@emeraldplatform/eth';
import { Currency, CurrencyCode } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import * as React from 'react';

const defaultStyles = {
  coins: {
    color: '#191919',
  },
  fiat: {
    color: '#191919',
  }
};

export interface IProps {
  symbol: string;

  /**
   * Base units (wei, satoshi, etc)
   */
  balance: Wei | BigNumber | string;

  /**
   * Decimals (8 for Bitcoin, 18 for Ethereum)
   */
  decimals: number;
  fiatRate?: number | null;
  fiatCurrency?: string;
  showFiat?: boolean;
  coinsStyle?: any;
  fiatStyle?: any;
  displayDecimals?: number
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
      if (BigNumber.isBigNumber(balance)) {
        coins = balance.dividedBy(new BigNumber(10).pow(decimals));
      } else {
        //Wei
        coins = balance.toWei().dividedBy(new BigNumber(10).pow(18));
      }
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
