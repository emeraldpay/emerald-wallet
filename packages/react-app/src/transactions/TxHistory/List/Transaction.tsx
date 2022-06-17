import { BlockchainCode, PersistentState } from '@emeraldwallet/core';
import { screen, wallet } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import TxItem from './TxItemView/TxItem';

interface OwnProps {
  tx?: PersistentState.Transaction;
}

interface DispatchProps {
  openAccount: (blockchain: BlockchainCode, address: string) => void;
  openTransaction: (tx: PersistentState.Transaction) => void;
}

const Transaction: React.FC<OwnProps & DispatchProps> = ({ tx, openAccount, openTransaction }) =>
  tx == null ? <></> : <TxItem tx={tx} openAccount={openAccount} openTransaction={() => openTransaction(tx)} />;

export default connect<{}, DispatchProps>(null, (dispatch) => {
  return {
    openAccount: (blockchain: BlockchainCode, address: string): void => {
      dispatch(wallet.actions.openAccountDetails(blockchain, address));
    },
    openTransaction: (tx): void => {
      dispatch(screen.actions.gotoScreen(screen.Pages.TX_DETAILS, tx));
    },
  };
})(Transaction);
