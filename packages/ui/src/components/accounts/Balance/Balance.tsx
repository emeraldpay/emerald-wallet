import * as React from 'react';
import BigNumber from 'bignumber.js';
import { fromBaseUnits } from '@emeraldplatform/core';
import {Currency, CurrencyCode} from '@emeraldwallet/core';
import {Wei} from "@emeraldplatform/eth";

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
  balance: Wei | string;

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
    let coinsStr = null;
    if (typeof balance === 'string') {
      const coins = fromBaseUnits(new BigNumber(balance), decimals);
      if (showFiat && fiatRate && fiatCurrency) {
        fiatAmount = Currency.format(Number(Currency.convert(coins.toString(), fiatRate)), fiatCurrency as CurrencyCode);
      }
      coinsStr = coins.toString();
    } else if (typeof balance === 'object') {
      coinsStr = balance.toEther(decimals, true);
    }
    const {fiatStyle, coinsStyle} = this.props;

    return (
      <div>
        <span id="balance" style={coinsStyle}>
          {balance ? coinsStr : '-'} {symbol}
        </span>
        {fiatAmount && <br/>}
        {fiatAmount && <span id="fiat" style={fiatStyle}>{fiatAmount} {fiatCurrency}</span>}
      </div>
    );
  }
}

export default Balance;
