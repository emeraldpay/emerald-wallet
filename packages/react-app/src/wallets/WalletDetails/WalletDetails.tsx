import { Wallet } from '@emeraldwallet/core';
import { accounts, screen } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import WalletDetailsView from './WalletDetailsView';

export interface IOwnProps {
  walletId: string;
}

export default connect(
  (state: any, ownProps: IOwnProps) => {
    // reload account from store, because it can be passed with id only if it was just imported
    const wallet = accounts.selectors.find(state, ownProps.walletId)!;

    return {
      showFiat: true,
      wallet
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
    updateWallet: (data: Wallet) => {
      dispatch(accounts.actions.updateWallet(data.id, data.name || '') as any);
    }
  })
)(WalletDetailsView);
