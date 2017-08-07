import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toNumber } from 'lib/convert';
import { Wei } from 'lib/types';
import { noShadow } from 'lib/styles';

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

class AccountBalanceRender extends React.Component {

    render() {
        const { balance, rates, showFiat, precision = 3 } = this.props;
        const { fiatStyle = defaultStyles.fiat, etcStyle = defaultStyles.etc } = this.props;

        const getRate = (b, pair) => {
            if (b !== null && typeof b !== 'undefined') {
                return b.getFiat(rates.get(pair));
            }
            return '$?';
        };
        const styles = {
            bc: {
                backgroundColor: 'inherit',
            },
        };
        let fiat = null;
        if (showFiat) {
            fiat = <span style={fiatStyle}>${getRate(balance, 'usd')}</span>;
        }
        return (
        <div style={{...styles.bc}}>
            <span style={etcStyle}>{balance ? balance.getEther(precision) : '-'} ETC</span>
            <br/>{fiat}
        </div>
        );
    }
}

AccountBalanceRender.propTypes = {
    balance: PropTypes.object.isRequired,
    rates: PropTypes.object.isRequired,
    showFiat: PropTypes.bool.isRequired,
};

export default connect(
    (state, ownProps) => {
        const rates = state.accounts.get('rates');
        const balance = ownProps.balance;
        const network = (state.network.get('chain').get('name') || '').toLowerCase();
        return {
            balance,
            rates,
            showFiat: (network === 'mainnet'),
        };
    },
    (dispatch, ownProps) => ({})
)(AccountBalanceRender);
