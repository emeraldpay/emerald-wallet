// @flow
import React from 'react';
import {withStyles} from '@material-ui/styles';
import {connect} from 'react-redux';
import Header from '@emeraldwallet/ui/lib/components/tx/TxHistory/Header';
import {List} from 'immutable';
import {searchTransactions, filterTransactions} from '../../../store/wallet/history/selectors';
import TxList from './List';

const styles2 = (theme) => ({
  container: {
    padding: '30px 30px 20px',
    backgroundColor: 'white',
    border: `1px solid ${theme.palette.divider}`,
  },
});

type
Props = {
  accountId: string,
  transactions: any,
  accounts: any
};

type
State = {
  txFilter: string,
  displayedTransactions: Object
};

class TransactionsHistory extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      txFilter: 'ALL',
      displayedTransactions: this.props.transactions,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line
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
  };

  onTxFilterChange = (event, value) => {
    const {accountId, transactions, accounts} = this.props;
    this.setState({
      txFilter: value,
      displayedTransactions: filterTransactions(value, accountId, transactions, accounts),
    });
  };

  render() {
    const {classes} = this.props;
    return (
      <div className={classes.container}>
        <Header
          onTxFilterChange={this.onTxFilterChange}
          txFilterValue={this.state.txFilter}
          onSearchChange={this.onSearchChange}
        />
        <TxList transactions={this.state.displayedTransactions} accountId={this.props.accountId}/>
      </div>
    );
  }
}

const StyledTransactionsHistory = withStyles(styles2)(TransactionsHistory);

export default connect(
  (state, ownProps) => {
    const transactionsAccounts = state.wallet.history.get('trackedTransactions', new List());
    const txs = ownProps.transactions || transactionsAccounts;
    return {
      transactions: txs.sortBy((tx) => tx.get('timestamp')).reverse(),
      accounts: state.accounts.get('accounts', new List()),
      accountId: ownProps.accountId,
    };
  },
  (dispatch, ownProps) => ({})
)(StyledTransactionsHistory);
