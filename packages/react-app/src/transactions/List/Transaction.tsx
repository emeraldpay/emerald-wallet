import { blockchainById, blockchainByName } from '@emeraldwallet/core';
import { addresses, blockchains, screen, settings, txhistory, wallet } from '@emeraldwallet/store';
import TxView from '@emeraldwallet/ui/lib/components/tx/TxHistory/TxList/TxItem';
import * as React from 'react';
import { connect } from 'react-redux';
import Balance from '../../common/Balance';
import i18n from '../../i18n';

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

export default connect(
  (state, ownProps: any) => {
    const tx = (ownProps.tx && ownProps.tx.toJS()) || {};
    const blockchain = tx.blockchain ? blockchainByName(tx.blockchain) : blockchainById(tx.chainId);

    const toAccount = addresses.selectors.find(state, tx.to, blockchain!.params.code) || {};
    const fromAccount = addresses.selectors.find(state, tx.from, blockchain!.params.code) || {};

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
