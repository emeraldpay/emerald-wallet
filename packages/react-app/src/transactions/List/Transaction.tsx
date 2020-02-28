import {blockchainById, blockchainByName, blockchainCodeToId} from '@emeraldwallet/core';
import {addresses, blockchains, screen, settings, State, wallet} from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import Balance from '../../common/Balance';
import i18n from '../../i18n';
import TxView from './TxItemView';

function txValueRenderer (showFiat: boolean) {
  return function renderer (balance: any, ticker: string) {
    return (
      <Balance
      // fiatStyle={fiatStyle}
        symbol={ticker}
        showFiat={showFiat}
        balance={balance.amount}
        decimals={balance.decimals}
        withAvatar={false}
      />
    );
  };
}

export default connect<any, any, any, State>(
  (state, ownProps: any) => {
    const tx = (ownProps.tx && ownProps.tx.toJS()) || {};
    const blockchain = tx.blockchain ? blockchainByName(tx.blockchain) : blockchainById(tx.chainId);
    const blockchainId = blockchainCodeToId(blockchain!.params.code);

    const wallets = addresses.selectors.all(state);
    wallets.findWalletByAddress(tx.to, blockchainId);

    const toAccount = wallets.findWalletByAddress(tx.to, blockchainId);
    const fromAccount = wallets.findWalletByAddress(tx.from, blockchainId);

    // console.log("accounts", toAccount, fromAccount);

    // TODO: fix it !
    const token = null; // state.tokens.get('tokens').find((t) => t.get('address') === tx.to);

    const showFiat = false;

    return {
      coinTicker: blockchain!.params.coinTicker,
      amountRenderer: txValueRenderer(showFiat),
      lang: i18n.language,
      tx,
      toAccount,
      fromAccount,
      token: null,
      netParams: {
        requiredConfirmations: settings.selectors.numConfirms(state),
        currentBlockHeight: blockchains.selectors.getHeight(state, blockchain!.params.coinTicker)
      }
    };
  },

  (dispatch, ownProps: any) => ({
    openTx: () => {
      const { tx } = ownProps;
      dispatch(screen.actions.gotoScreen('transaction', {
        hash: tx.get('hash'),
        accountId: ownProps.accountId
      }));
    },
    openAccount: (address: string) => {
      const { tx } = ownProps;
      dispatch(wallet.actions.openAccountDetails(tx.get('blockchain'), address));
    }
  })
)(TxView);
