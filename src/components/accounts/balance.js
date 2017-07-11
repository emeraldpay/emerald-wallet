import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardHeader } from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import { deepOrange300, purple500 } from 'material-ui/styles/colors';
import { toNumber } from 'lib/convert';
import { Wei } from 'lib/types';
import { noShadow } from 'lib/styles';

class AccountBalanceRender extends React.Component {

    render() {
        const { balance, rates, withAvatar, showFiat } = this.props;

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
            main: {
                fontSize: "16px",
                fontWeight: 500
            },
            fiat: {
                color: "#666"
            }
        };
        let fiat = null;
        if (showFiat) {
            fiat = <span style={styles.fiat}>${getRate(balance, 'usd')}</span>;
        }
        return (
        <div style={{...styles.bc}}>
            <span style={styles.main}>{balance.getEther(3)} ETC</span>
            <br/>{fiat}
        </div>
        );
    }
}

AccountBalanceRender.propTypes = {
    balance: PropTypes.object.isRequired,
    rates: PropTypes.object.isRequired,
    withAvatar: PropTypes.bool.isRequired,
    showFiat: PropTypes.bool.isRequired,
};

const AccountBalance = connect(
    (state, ownProps) => {
        const rates = state.accounts.get('rates');
        const balance = ownProps.balance;
        const withAvatar = ownProps.withAvatar || false;
        const network = (state.network.get('chain').get('name') || '').toLowerCase();
        return {
            balance,
            rates,
            withAvatar,
            showFiat: (network === 'mainnet'),
        };
    },
    (dispatch, ownProps) => ({})
)(AccountBalanceRender);

export default AccountBalance;
