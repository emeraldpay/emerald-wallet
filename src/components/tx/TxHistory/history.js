// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';
import { Card } from 'emerald-js-ui';
import muiThemeable from 'material-ui/styles/muiThemeable';

import { searchTransactions, filterTransactions } from '../../../store/wallet/history/selectors';
import Header from './Header';
import TxList from './List';

import styles from './history.scss';

type Props = {
  accountId: string,
  transactions: any,
  accounts: any
}

type State = {
  txFilter: string,
  displayedTransactions: Object
}

class TransactionsHistory extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      txFilter: 'ALL',
      displayedTransactions: this.props.transactions,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.transactions) {
      this.setState({
        ...this.state,
        displayedTransactions: filterTransactions(this.state.txFilter, this.props.accountId, nextProps.transactions, this.props.accounts),
      });
    }
  }
  onSearchChange = (e) => {
    return this.setState({
      displayedTransactions: searchTransactions(e.target.value, this.props.transactions),
    });
  }
  onTxFilterChange = (value) => {
    this.setState({
      txFilter: value,
      displayedTransactions: filterTransactions(value, this.props.accountId, this.props.transactions, this.props.accounts),
    });
  }
  render() {
    return (
      <Card>
        <div className={ styles.container } style={{border: `1px solid ${this.props.muiTheme.palette.borderColor}`}}>
          <Header onTxFilterChange={this.onTxFilterChange} value={this.state.txFilter} onSearchChange={this.onSearchChange}/>
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
)(muiThemeable()(TransactionsHistory));
