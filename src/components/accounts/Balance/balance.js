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

class AccountBalance extends React.Component {
    static propTypes = {
      precision: PropTypes.number,
      symbol: PropTypes.string.isRequired,
      balance: PropTypes.object.isRequired,
      fiatRate: PropTypes.number.isRequired,
      showFiat: PropTypes.bool.isRequired,
      coinsStyle: PropTypes.object,
      fiatStyle: PropTypes.object,
      fiatCurrency: PropTypes.string,
    }

    render() {
      const { balance, showFiat, fiatCurrency, fiatRate, precision = 3, symbol } = this.props;
      const { fiatStyle = defaultStyles.fiat, coinsStyle = defaultStyles.coins } = this.props;

      return (
        <div>
          <span style={ coinsStyle }>
            { balance ? balance.getDecimalized(precision) : '-'} { symbol }
          </span>
          <br/>
          { showFiat && balance &&
                <span style={ fiatStyle }>{ Currency.format(balance.convert(fiatRate), fiatCurrency) }</span> }
        </div>
      );
    }
}

export default connect(
  (state, ownProps) => {
    const fiatCurrency = state.wallet.settings.get('localeCurrency');
    const fiatRate = state.wallet.settings.get('localeRate');
    const balance = ownProps.balance;
    return {
      symbol: ownProps.symbol,
      balance,
      fiatCurrency,
      fiatRate,
    };
  },
  (dispatch, ownProps) => ({})
)(AccountBalance);
