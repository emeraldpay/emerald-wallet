/* @flow */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';

import Card from '../../../elements/Card';
import Header from './Header';
import TxList from './List';

import classes from './history.scss';

const TransactionsHistory = ({ transactions }) => {
    return (
        <Card>
            <div className={ classes.container }>
                <Header />
                <TxList transactions={ transactions } />
            </div>
        </Card>
    );
};

TransactionsHistory.propTypes = {
    transactions: PropTypes.object.isRequired,
};

export default connect(
    (state, ownProps) => {
        const transactionsAccounts = state.wallet.history.get('trackedTransactions', new List());
        const txs = ownProps.transactions || transactionsAccounts;
        return {
            transactions: txs.reverse(),
        };
    },
    (dispatch, ownProps) => ({
    })
)(TransactionsHistory);
