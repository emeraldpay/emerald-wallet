import { Wallet } from '@emeraldwallet/core';
import { accounts, screen, txhistory } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import TxHistory from '../../transactions/TxHistory';
import WalletDetailsView from './WalletDetailsView';

export interface IOwnProps {
  walletId: string;
}

export default connect(
  (state: any, ownProps: IOwnProps) => {
    // reload account from store, because it can be passed with id only if it was just imported
    const wallet = accounts.selectors.find(state, ownProps.walletId)!;
    const transactions = txhistory.selectors.getTransactions(state, wallet.accounts);

    return {
      showFiat: true,
      wallet,
      transactions,
      txList: (<TxHistory transactions={transactions} walletAccounts={wallet.accounts} />)
    };
  },
  (dispatch, ownProps) => ({
    // createTx: () => {
    //   const { account } = ownProps;
    //   dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, { account }));
    // },
    // showReceiveDialog: () => {
    //   const { account } = ownProps;
    //   const blockchain = blockchainByName(account.blockchain);
    //   const address = {
    //     value: account.id,
    //     blockchain: blockchain.params.code,
    //     coinTicker: blockchain.params.coinTicker
    //   };
    //   dispatch(screen.actions.showDialog('receive', address));
    // },
    goBack: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
    },
    editAccount: (data: Wallet) => {
      return new Promise((resolve, reject) => {
        dispatch(accounts.actions.updateWallet(data.id, data.name || '', data.description || '') as any)
          .then((response: any) => {
            resolve(response);
          });
      });
    }
  })
)(WalletDetailsView);
