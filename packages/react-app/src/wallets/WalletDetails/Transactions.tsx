import { accounts, txhistory } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import TxHistory from '../../transactions/TxHistory';
import {WalletEntry} from "@emeraldpay/emerald-vault-core";

export interface IOwnProps {
  walletId: string;
}

interface IProps {
  transactions: txhistory.types.TransactionsList;
  entries: WalletEntry[];
}

function TxHistoryView (props: IProps) {
  return (
    <TxHistory
      transactions={props.transactions}
      walletAccounts={props.entries}
    />
  );
}

export default connect<IProps, {}, IOwnProps, {}>(
  (state: any, ownProps: IOwnProps): IProps => {
    const wallet = accounts.selectors.findWallet(state, ownProps.walletId)!;
    const transactions = txhistory.selectors.getTransactions(state, wallet.entries);

    return {
      entries: wallet.entries,
      transactions
    };
  }
)(TxHistoryView);
