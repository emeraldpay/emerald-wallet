import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { PersistentState } from '@emeraldwallet/core';
import { txhistory } from '@emeraldwallet/store';
import { createStyles, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import Header from './Header';
import List from './List';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    container: {
      padding: '30px 30px 20px',
      backgroundColor: 'white',
      border: `1px solid ${theme.palette.divider}`,
    },
  }),
);

interface OwnProps {
  entries: WalletEntry[];
  transactions: PersistentState.Transaction[];
}

interface StateProps {
  txs: PersistentState.Transaction[];
}

const TxHistory: React.FC<OwnProps & StateProps> = ({ entries, txs }) => {
  const styles = useStyles();

  const [filter, setFilter] = React.useState('ALL');
  const [transactions, setTransactions] = React.useState(txs);

  const onTxFilterChange = React.useCallback(
    (event: any, value: string) => {
      setFilter(value);
      setTransactions(txhistory.selectors.filterTransactions(entries, txs, value));
    },
    [entries, txs],
  );

  const onSearchChange = React.useCallback(
    (event: any) => setTransactions(txhistory.selectors.searchTransactions(txs, event.target.value)),
    [txs],
  );

  React.useEffect(() => {
    setTransactions(txs);
  }, [txs]);

  return (
    <div className={styles.container}>
      <Header onTxFilterChange={onTxFilterChange} txFilterValue={filter} onSearchChange={onSearchChange} />
      <List transactions={transactions} />
    </div>
  );
};

export default connect<StateProps, {}, OwnProps>((state, ownProps) => {
  const sorted = ownProps.transactions.sort(
    (first, second) => (first.block?.timestamp.getTime() ?? 0) - (second.block?.timestamp.getTime() ?? 0),
  );

  return { txs: sorted.reverse() };
})(TxHistory);
