// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';

import { searchTransactions, filterTransactions } from '../../../store/wallet/history/selectors';

import Card from '../../../elements/Card';
import Header from './Header';
import TxList from './List';
import TokenUnits from '../../../lib/tokenUnits';

import styles from './history.scss';

type Props = {
  accountId: string,
  transactions: any,
  accounts: any
}

type State = {
  txFilter: string,
  displayedTransactions: Array
}

class TransactionsHistory extends React.Component<Props> {
  getInitialState() {
    return {
      txFilter: 'ALL',
      displayedTransactions: this.props.transactions,
    }
  }
  onSearchChange(e) {
    return this.setState({
      displayedTransactions: searchTransactions(e.target.value, this.props.transactions)
    });
  }
  onTxFilterChange(value) {
    if (value === 'ALL') {
      return this.setState({
        txFilter: value,
        displayedTransactions: this.props.transactions,
      });
    }
    this.setState({
      txFilter: value,
      displayedTransactions: filterTransactions(value, this.props.accountId, this.props.transactions, this.props.accounts)
    });
  }
  render() {
    return (
      <Card>
        <div className={ styles.container }>
          <Header onTxFilterChange={this.onTxFilterChange.bind(this)} value={this.state.txFilter} onSearchChange={this.onSearchChange.bind(this)}/>
          <TxList transactions={ this.state.displayedTransactions } accountId={ this.props.accountId }/>
        </div>
      </Card>
    );
  }
}

export default connect(
  (state, ownProps) => {
    const transactionsAccounts = state.wallet.history.get('trackedTransactions', new List());
    const txs = ownProps.transactions || transactionsAccounts;
    return {
      transactions: txs.reverse(),
      accounts: state.accounts.get('accounts', new List()),
      accountId: ownProps.accountId,
    };
  },
  (dispatch, ownProps) => ({
  })
)(TransactionsHistory);
