import { StoredTransaction } from '@emeraldwallet/store';
import { Theme } from '@material-ui/core';
import { useTheme } from '@material-ui/styles';
import * as React from 'react';
import TxItem from './Transaction';

interface OwnProps {
  transactions: StoredTransaction[];
}

const TransactionsList: React.FC<OwnProps> = ({ transactions }) => {
  const theme = useTheme<Theme>();

  return transactions.length > 0 ? (
    <>
      {transactions.map((tx) => (
        <TxItem key={tx.txId} tx={tx} />
      ))}
    </>
  ) : (
    <div style={{ paddingTop: 20, color: theme.palette.text.secondary }}>There are no transactions.</div>
  );
};

export default TransactionsList;
