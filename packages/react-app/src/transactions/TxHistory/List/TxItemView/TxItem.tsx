import { BlockchainCode, PersistentState } from '@emeraldwallet/core';
import { createStyles } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';

const styles = createStyles({});

interface OwnProps {
  tx: PersistentState.Transaction;
  openAccount(blockchain: BlockchainCode, address: string): void;
  openTransaction(): void;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const TxItem: React.FC<OwnProps & StylesProps> = ({ classes, tx, openAccount, openTransaction }) => (
  <div onClick={openTransaction}>{tx.changes?.[0].amountValue?.toString() ?? 0}</div>
);

export default withStyles(styles)(TxItem);
