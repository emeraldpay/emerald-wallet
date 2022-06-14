import { BlockchainCode, PersistentState } from '@emeraldwallet/core';
import { createStyles, TableCell, TableRow } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';

const styles = createStyles({
  columnValue: {
    paddingBottom: 15,
    paddingLeft: 0,
    paddingTop: 15,
    width: 100,
  },
});

interface OwnProps {
  tx: PersistentState.Transaction;
  openAccount(blockchain: BlockchainCode, address: string): void;
  openTransaction(): void;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const TxItem: React.FC<OwnProps & StylesProps> = ({ classes, tx, openAccount, openTransaction }) => (
  <TableRow>
    <TableCell className={classes.columnValue} onClick={openTransaction}>
      {tx.changes?.[0].amountValue?.toString() ?? 0}
    </TableCell>
  </TableRow>
);

export default withStyles(styles)(TxItem);
