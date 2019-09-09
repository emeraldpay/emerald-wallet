// @flow
import React from 'react';
import {withStyles} from '@material-ui/styles';
import {connect} from 'react-redux';
import Header from '@emeraldwallet/ui/lib/components/tx/TxHistory/Header';
import {txhistory, addresses} from '@emeraldwallet/store';
import {List} from 'immutable';
import TxList from './List';

const styles2 = (theme) => ({
  container: {
    padding: '30px 30px 20px',
    backgroundColor: 'white',
    border: `1px solid ${theme.palette.divider}`,
  },
});

type
ILandingProps = {
  accountId: string,
  transactions: any,
  accounts: any
};

type
State = {
  txFilter: string,
  displayedTransactions: Object
};

class TransactionsHistory extends React.Component<ILandingProps, State> {
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
        displayedTransactions: txhistory.selectors.filterTransactions(this.state.txFilter, this.props.accountId, nextProps.transactions, this.props.accounts),
      });
    }
  }

  onSearchChange = (e) => {
    return this.setState({
      displayedTransactions: txhistory.selectors.searchTransactions(e.target.value, this.props.transactions),
    });
  };

  onTxFilterChange = (event, value) => {
    const {accountId, transactions, accounts} = this.props;
    this.setState({
      txFilter: value,
      displayedTransactions: txhistory.selectors.filterTransactions(value, accountId, transactions, accounts),
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
    const txs = ownProps.transactions || txhistory.selectors.allTrackedTxs(state);
    return {
      transactions: txs.sortBy((tx) => tx.get('timestamp')).reverse(),
      accounts: addresses.selectors.all(state),
      accountId: ownProps.accountId,
    };
  },
  (dispatch, ownProps) => ({})
)(StyledTransactionsHistory);
