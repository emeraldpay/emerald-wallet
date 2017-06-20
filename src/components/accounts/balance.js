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
        const { balance, rates } = this.props;

        const getRate = (b, pair) => {
            if (b !== null && typeof b !== 'undefined') {
                return b.getFiat(rates.get(pair));
            }
            return '$?';
        };

        return (
        <Card style={noShadow}>
            <CardHeader
                title={`${balance.getEther(6)} ETC`}
                subtitle={`$${getRate(balance, 'usd')}`}
                avatar={
                    <Avatar color={deepOrange300}
                          backgroundColor={purple500}
                          size={30}>⟠
                        </Avatar>
                }
            />
        </Card>
        );
    }
}

AccountBalanceRender.propTypes = {
    balance: PropTypes.object.isRequired,
    rates: PropTypes.object.isRequired,
};

const AccountBalance = connect(
    (state, ownProps) => {
        const rates = state.accounts.get('rates');
        const balance = ownProps.balance;
        return {
            balance,
            rates,
        };
    },
    (dispatch, ownProps) => ({})
)(AccountBalanceRender);

export default AccountBalance;
