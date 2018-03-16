import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Currency } from '../../../lib/currency';

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
  }

  static defaultProps = {
    showFiat: false,
    fiatStyle: defaultStyles.fiat,
    coinsStyle: defaultStyles.coins,
  };

  render() {
    const { balance, showFiat, fiatCurrency, fiatRate, precision = 3, symbol } = this.props;
    const { fiatStyle, coinsStyle } = this.props;
    let fiatAmount = null;
    if (showFiat && balance && fiatRate) {
      fiatAmount = Currency.format(balance.convert(fiatRate), fiatCurrency);
    }

    return (
      <div>
        <span style={coinsStyle}>
          {balance ? balance.getDecimalized(precision) : '-'} {symbol}
        </span>
        <br />
        {fiatAmount && <span style={fiatStyle}>{fiatAmount}</span> }
      </div>
    );
  }
}

export default connect(
  (state, ownProps) => {
    const fiatCurrency = state.wallet.settings.get('localeCurrency');
    const fiatRate = state.wallet.settings.get('localeRate');
    return {
      symbol: ownProps.symbol,
      balance: ownProps.balance,
      fiatCurrency,
      fiatRate,
    };
  },
  (dispatch, ownProps) => ({})
)(Balance);
