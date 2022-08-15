import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { StoredTransaction, txhistory } from '@emeraldwallet/store';
import { Theme, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
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
  transactions: StoredTransaction[];
}

const TxHistory: React.FC<OwnProps> = ({ entries, transactions }) => {
  const styles = useStyles();

  const [filter, setFilter] = React.useState('ALL');
  const [txs, setTxs] = React.useState(transactions);

  const onTxFilterChange = React.useCallback(
    (event: any, value: string) => {
      setFilter(value);
      setTxs(txhistory.selectors.filterTransactions(entries, transactions, value));
    },
    [entries, transactions],
  );

  const onSearchChange = React.useCallback(
    (event: any) => setTxs(txhistory.selectors.searchTransactions(transactions, event.target.value)),
    [transactions],
  );

  React.useEffect(() => {
    setTxs(transactions);
  }, [transactions]);

  return (
    <div className={styles.container}>
      <Header onTxFilterChange={onTxFilterChange} txFilterValue={filter} onSearchChange={onSearchChange} />
      <List transactions={txs} />
    </div>
  );
};

export default TxHistory;
