import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Currency } from '@emeraldwallet/core';
import WalletSettings from '../../../store/wallet/settings';

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

export class Balance extends React.Component {
  static propTypes = {
    precision: PropTypes.number,
    symbol: PropTypes.string.isRequired,
    balance: PropTypes.object.isRequired,
    fiatRate: PropTypes.number,
    showFiat: PropTypes.bool.isRequired,
    coinsStyle: PropTypes.object,
    fiatStyle: PropTypes.object,
    fiatCurrency: PropTypes.string,
  };

  static defaultProps = {
    showFiat: false,
    fiatStyle: defaultStyles.fiat,
    coinsStyle: defaultStyles.coins,
  };

  render() {
    const {
      balance, showFiat, fiatCurrency, fiatRate, precision = 3, symbol, fiatAmount,
    } = this.props;
    const { fiatStyle, coinsStyle } = this.props;

    return (
      <div>
        <span style={coinsStyle}>
          {balance ? balance.getDecimalized(precision) : '-'} {symbol}
        </span>
        {fiatAmount && <br /> }
        {fiatAmount && <span style={fiatStyle}>{fiatAmount} {fiatCurrency}</span> }
      </div>
    );
  }
}

export default connect(
  (state, ownProps) => {
    const fiatCurrency = WalletSettings.selectors.fiatCurrency(state);
    const fiatRate = WalletSettings.selectors.fiatRate(state);
    let fiatAmount = null;
    if (ownProps.showFiat && ownProps.balance && fiatRate) {
      fiatAmount = Currency.format(Currency.convert(ownProps.balance.value.toString(10), fiatRate), fiatCurrency);
    }
    return {
      symbol: ownProps.symbol,
      balance: ownProps.balance,
      fiatCurrency,
      fiatRate,
      fiatAmount,
    };
  },
  (dispatch, ownProps) => ({})
)(Balance);
