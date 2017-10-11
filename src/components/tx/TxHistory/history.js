// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';

import Card from '../../../elements/Card';
import Header from './Header';
import TxList from './List';

import styles from './history.scss';

const TransactionsHistory = ({ transactions, accountId }) => {
    return (
        <Card>
            <div className={ styles.container }>
                <Header />
                <TxList transactions={ transactions } accountId={ accountId }/>
            </div>
        </Card>
    );
};

TransactionsHistory.propTypes = {
    transactions: PropTypes.object.isRequired,
    accountId: PropTypes.string,
};

export default connect(
    (state, ownProps) => {
        const transactionsAccounts = state.wallet.history.get('trackedTransactions', new List());
        const txs = ownProps.transactions || transactionsAccounts;
        return {
            transactions: txs.reverse(),
            accountId: ownProps.accountId,
        };
    },
    (dispatch, ownProps) => ({
    })
)(TransactionsHistory);
