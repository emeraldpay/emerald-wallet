import {IState, txhistory} from '@emeraldwallet/store';
import {withStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {connect} from 'react-redux';
import List from './List';
import Header from './Header';
import {IStoredTransaction} from "@emeraldwallet/core";
import {WalletEntry} from "@emeraldpay/emerald-vault-core/lib/types";

const styles = (theme?: any) => ({
  container: {
    padding: '30px 30px 20px',
    backgroundColor: 'white',
    border: `1px solid ${theme.palette.divider}`
  }
});

interface IProps {
  transactions: IStoredTransaction[];
  accounts: WalletEntry[];
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

// Component properties
interface OwnProps {
  transactions: IStoredTransaction[],
  walletAccounts: WalletEntry[]
}

export default connect(
  (state: IState, ownProps: OwnProps) => {
    const txs = ownProps.transactions;
    return {
      transactions: txs.sort((a, b) =>
        (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0)
      ).reverse(),
      accounts: ownProps.walletAccounts
    };
  },
  (dispatch, ownProps) => ({})
)(StyledTransactionsHistory);
