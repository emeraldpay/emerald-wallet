import { StoredTransaction } from '@emeraldwallet/store';
import { createStyles, Theme } from '@material-ui/core';
import { useTheme, withStyles } from '@material-ui/styles';
import * as React from 'react';
import Transaction from './Transaction';

const styles = createStyles({});

interface OwnProps {
  transactions: StoredTransaction[];
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const TransactionsList: React.FC<OwnProps & StylesProps> = ({ classes, transactions }) => {
  const theme = useTheme<Theme>();

  return transactions.length > 0 ? (
    <>
      {transactions.map((tx) => (
        <Transaction key={tx.txId} tx={tx} />
      ))}
    </>
  ) : (
    <div style={{ paddingTop: 20, color: theme.palette.text.secondary }}>There are no transactions.</div>
  );
};

export default withStyles(styles)(TransactionsList);
