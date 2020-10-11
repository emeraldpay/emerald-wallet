import {IState, txhistory} from '@emeraldwallet/store';
import {makeStyles, withStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {connect} from 'react-redux';
import List from './List';
import Header from './Header';
import {IStoredTransaction} from "@emeraldwallet/core";
import {WalletEntry} from "@emeraldpay/emerald-vault-core";
import {Box, createStyles, Theme} from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    container: {
      padding: '30px 30px 20px',
      backgroundColor: 'white',
      border: `1px solid ${theme.palette.divider}`
    }
  })
);

/**
 *
 */
const Component = (({useTransactions, accounts}: Props & Actions & OwnProps) => {
  const styles = useStyles();

  const [txFilter, setTxFilter] = React.useState('ALL');
  const [displayedTransactions, setDisplayedTransactions] = React.useState(
    ([] as IStoredTransaction[]).concat(useTransactions)
  );

  const onTxFilterChange = (event: any, value: any) => {
    const txes = txhistory.selectors.filterTransactions(value, null, useTransactions, accounts);
    setTxFilter(value);
    setDisplayedTransactions(txes);
  }

  const onSearchChange = (e: any) => {
    const txes = txhistory.selectors.searchTransactions(e.target.value, useTransactions);
    setDisplayedTransactions(txes);
  }

  return (
    <div className={styles.container}>
      <Header
        onTxFilterChange={onTxFilterChange}
        txFilterValue={txFilter}
        onSearchChange={onSearchChange}
      />
      <List
        transactions={displayedTransactions}
      />
    </div>
  );
})

// State Properties
interface Props {
  useTransactions: IStoredTransaction[],
}

// Actions
interface Actions {
}

// Component properties
interface OwnProps {
  transactions: IStoredTransaction[],
  accounts: WalletEntry[]
}

export default connect(
  (state: IState, ownProps: OwnProps) => {
    const sorted = ownProps.transactions.sort((a, b) =>
      (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0)
    );
    return {
      useTransactions: sorted.reverse()
    };
  },
  (dispatch, ownProps) => ({})
)((Component));
