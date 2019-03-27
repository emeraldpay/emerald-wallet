import * as React from 'react';
import BigNumber from 'bignumber.js';
import { fromBaseUnits } from '@emeraldplatform/core';
import {Currency, CurrencyCode} from '@emeraldwallet/core';

const defaultStyles = {
  fiat: {
    color: '#191919',
    fontSize: '14px',
    lineHeight: '16px',
  },
  coins: {
    lineHeight: '24px',
    fontSize: '16px',
    color: '#191919',
  },
};

interface Props {
  symbol: string;

  /**
   * Base units (wei, satoshi, etc)
   */
  balance: string;

  /**
   * Decimals (8 for Bitcoin, 18 for Ethereum)
   */
  decimals: number;
  fiatRate?: number;
  fiatCurrency?: string;
  showFiat?: boolean;
  coinsStyle?: any;
  fiatStyle?: any;
}

export class Balance extends React.Component<Props> {
  static defaultProps = {
    showFiat: false,
    fiatStyle: defaultStyles.fiat,
    coinsStyle: defaultStyles.coins,
  };

  render() {
    const {
      balance, showFiat, fiatCurrency, fiatRate, symbol, decimals,
    } = this.props;

    let fiatAmount = null;
    const coins = fromBaseUnits(new BigNumber(balance), decimals);
    if (showFiat && fiatRate && fiatCurrency) {
      fiatAmount = Currency.format(Number(Currency.convert(coins.toString(), fiatRate)), fiatCurrency as CurrencyCode);
    }
    const {fiatStyle, coinsStyle} = this.props;

    return (
      <div>
        <span id="balance" style={coinsStyle}>
          {balance ? coins.toString() : '-'} {symbol}
        </span>
        {fiatAmount && <br/>}
        {fiatAmount && <span id="fiat" style={fiatStyle}>{fiatAmount} {fiatCurrency}</span>}
      </div>
    );
  }
}

export default Balance;
