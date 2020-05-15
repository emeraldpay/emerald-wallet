import { IState, txhistory } from '@emeraldwallet/store';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import List from './List';
import Header from './Header';

const styles = (theme?: any) => ({
  container: {
    padding: '30px 30px 20px',
    backgroundColor: 'white',
    border: `1px solid ${theme.palette.divider}`
  }
});

interface IProps {
  transactions: any;
  accounts: any;
  classes: any;
}

interface IHistoryState {
  txFilter: string;
  displayedTransactions: any;
}

class TransactionsHistory extends React.Component<IProps, IHistoryState> {
  constructor (props: IProps) {
    super(props);
    this.state = {
      txFilter: 'ALL',
      displayedTransactions: this.props.transactions
    };
  }

  public onSearchChange = (e: any) => {
    return this.setState({
      displayedTransactions: txhistory.selectors.searchTransactions(e.target.value, this.props.transactions)
    });
  }

  public onTxFilterChange = (event: any, value: any) => {
    const { transactions } = this.props;
    this.setState({
      txFilter: value,
      displayedTransactions: txhistory.selectors.filterTransactions(value, null, transactions, this.props.accounts)
    });
  }

  public render () {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <Header
          onTxFilterChange={this.onTxFilterChange}
          txFilterValue={this.state.txFilter}
          onSearchChange={this.onSearchChange}
        />
        <List
          transactions={this.state.displayedTransactions}
        />
      </div>
    );
  }
}

const StyledTransactionsHistory = withStyles(styles)(TransactionsHistory);

export default connect(
  (state: IState, ownProps: any) => {
    const txs = ownProps.transactions;
    return {
      transactions: txs.sortBy((tx: any) => tx.get('timestamp')).reverse(),
      accounts: ownProps.walletAccounts
    };
  },
  (dispatch, ownProps) => ({})
)(StyledTransactionsHistory);
