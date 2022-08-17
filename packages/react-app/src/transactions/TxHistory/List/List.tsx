import { StoredTransaction } from '@emeraldwallet/store';
import { Button, Grid, Theme } from '@material-ui/core';
import { useTheme } from '@material-ui/styles';
import * as React from 'react';
import TxItem from './Transaction';

interface OwnProps {
  cursor?: string | null;
  transactions: StoredTransaction[];
  onShowMore(): void;
}

const TransactionsList: React.FC<OwnProps> = ({ cursor, transactions, onShowMore }) => {
  const theme = useTheme<Theme>();

  return transactions.length > 0 ? (
    <>
      {transactions.map((tx) => (
        <TxItem key={tx.txId} tx={tx} />
      ))}
      {cursor != null && (
        <Grid container justify="center">
          <Button color="primary" variant="outlined" onClick={onShowMore}>
            Show more
          </Button>
        </Grid>
      )}
    </>
  ) : (
    <div style={{ color: theme.palette.text.secondary }}>There are no transactions.</div>
  );
};

export default TransactionsList;
