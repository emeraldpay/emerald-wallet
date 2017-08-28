/* @flow */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';

import Card from '../../../elements/Card';
import { gotoScreen } from '../../../store/screenActions';

import Header from './Header';
import TxList from './List';

import classes from './history.scss';

const Render = ({ transactions }) => {
    return (
        <Card>
            <div className={ classes.container }>
                <Header />
                <TxList transactions={ transactions } />
            </div>
        </Card>
    );
};

Render.propTypes = {
    transactions: PropTypes.object.isRequired,
};

const TransactionsHistory = connect(
    (state, ownProps) => {
        const transactionsAccounts = state.accounts.get('trackedTransactions', new List());
        const txs = ownProps.transactions || transactionsAccounts;
        return {
            transactions: txs.reverse(),
        };
    },
    (dispatch, ownProps) => ({
    })
)(Render);

export default TransactionsHistory;
