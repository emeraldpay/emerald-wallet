import { PersistentState } from '@emeraldwallet/core';
import { createStyles, Table, TableBody, TableCell, TableHead, TableRow, Theme } from '@material-ui/core';
import { useTheme, withStyles } from '@material-ui/styles';
import * as React from 'react';
import Transaction from './Transaction';

const styles = createStyles({
  columnTitle: {
    fontSize: '11px !important',
    fontWeight: 500,
    letterSpacing: 1,
    lineHeight: 1,
    textTransform: 'uppercase',
  },
});

interface OwnProps {
  transactions: PersistentState.Transaction[];
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const TransactionsList: React.FC<OwnProps & StylesProps> = ({ classes, transactions }) => {
  const theme = useTheme<Theme>();

  return transactions.length > 0 ? (
    <Table style={{ background: theme.palette.primary.contrastText }}>
      <TableHead>
        <TableRow>
          <TableCell className={classes.columnTitle}>Amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map((tx) => (
          <Transaction hash={tx.txId} key={tx.txId} />
        ))}
      </TableBody>
    </Table>
  ) : (
    <div style={{ paddingTop: 20, color: theme.palette.text.secondary }}>There are no transactions.</div>
  );
};

export default withStyles(styles)(TransactionsList);
