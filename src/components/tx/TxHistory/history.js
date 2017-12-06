// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';

import Card from '../../../elements/Card';
import Header from './Header';
import TxList from './List';
import TokenUnits from '../../../lib/tokenUnits';

import styles from './history.scss';

const getFieldForFilter = (txFilter) => {
  if (txFilter === 'IN') {
    return 'to';
  }
  if (txFilter === 'OUT') {
    return 'from';
  }
};

type Props = {
  accountId: string,
  transactions: any,
  accounts: any
}

class TransactionsHistory extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      txFilter: 'ALL',
      displayedTransactions: this.props.transactions,
    };
  }
  onSearchChange(e) {
    const value = e.target.value;
    const filteredTxes = this.props.transactions.filter((tx) => {
      const fieldsToCheck = ['to', 'from', 'hash', 'value'];
      const found = fieldsToCheck.filter((field) => {
        // search for amount
        if (field === 'value') {
          const txValue = tx.get('value') ? new TokenUnits(tx.get('value').value(), 18) : null;
          if (!txValue) {
            return false;
          }
          return txValue.getDecimalized(3).toString().includes(value);
        }
        return tx.get(field).includes(value);
      });
      return found.length > 0;
    });
    return this.setState({
      displayedTransactions: filteredTxes,
    });
  }
  onTxFilterChange(value) {
    if (value === 'ALL') {
      return this.setState({
        txFilter: value,
        displayedTransactions: this.props.transactions,
      });
    }

    const inOrOut = getFieldForFilter(value);
    const filteredTxes = this.props.transactions.filter((tx) => {
      const accountAddress = tx.get(inOrOut);
      if (this.props.accountId) {
        return accountAddress === this.props.accountId;
      }
      const walletAccounts = this.props.accounts;
      const belongsToAccount = walletAccounts.filter((account) => {
        return accountAddress === account.get('id');
      }).toJS().length > 0;
      return belongsToAccount;
    });

    this.setState({
      txFilter: value,
      displayedTransactions: filteredTxes,
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
