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
    etc: {
        lineHeight: '24px',
        fontSize: '16px',
        color: '#191919',
    },
};

class AccountBalance extends React.Component {

    calcFiat = (balance, rate) => {
        if (balance !== null && typeof balance !== 'undefined') {
            return balance.getFiat(rate);
        }
        return 0;
    };

    render() {
        const { balance, showFiat, fiatCurrency, fiatRate, precision = 3 } = this.props;
        const { fiatStyle = defaultStyles.fiat, etcStyle = defaultStyles.etc } = this.props;

        return (
            <div>
                <span style={ etcStyle }>
                    { balance ? balance.getEther(precision) : '-'} ETC
                </span>
                <br/>
                { showFiat &&
                <span style={ fiatStyle }>{ Currency.format(this.calcFiat(balance, fiatRate), fiatCurrency) }</span> }
            </div>
        );
    }
}

AccountBalance.propTypes = {
    balance: PropTypes.object.isRequired,
    fiatRate: PropTypes.number.isRequired,
    showFiat: PropTypes.bool.isRequired,
};

export default connect(
    (state, ownProps) => {
        const fiatCurrency = state.wallet.settings.get('localeCurrency');
        const fiatRate = state.wallet.settings.get('localeRate');

        const balance = ownProps.balance;
        const network = (state.launcher.get('chain').get('name') || '').toLowerCase();
        return {
            balance,
            fiatCurrency,
            fiatRate,
            showFiat: (network === 'mainnet'),
        };
    },
    (dispatch, ownProps) => ({})
)(AccountBalance);
