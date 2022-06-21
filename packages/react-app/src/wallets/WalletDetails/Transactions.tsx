import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { accounts, IState, StoredTransaction, txhistory } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import TxHistory from '../../transactions/TxHistory';

interface OwnProps {
  walletId: string;
}

interface StateProps {
  entries: WalletEntry[];
  transactions: StoredTransaction[];
}

const Transactions: React.FC<OwnProps & StateProps> = ({ entries, transactions }) => (
  <TxHistory entries={entries} transactions={transactions} />
);

export default connect<StateProps, {}, OwnProps, IState>((state, ownProps) => {
  const { entries = [] } = accounts.selectors.findWallet(state, ownProps.walletId) ?? {};
  const transactions = txhistory.selectors.getTransactions(state, entries);

  return {
    entries,
    transactions,
  };
})(Transactions);
