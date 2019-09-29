import React from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import {blockchainById, blockchainByName } from '@emeraldwallet/core';
import TxView from '@emeraldwallet/ui/lib/components/tx/TxHistory/TxList/TxItem';
import { blockchains, txhistory, addresses, settings, screen } from '@emeraldwallet/store';
import { Balance, i18n } from '@emeraldwallet/react-app';

import Wallet from '../../../../store/wallet';

function txValueRenderer(showFiat) {
  return function renderer(balance, ticker) {
    return (<Balance
      // fiatStyle={fiatStyle}
      symbol={ ticker }
      showFiat={ showFiat }
      balance={ balance.amount }
      decimals={ balance.decimals }
      withAvatar={ false }
    />);
  };
}

export default connect(
  (state, ownProps) => {
    const tx = (ownProps.tx && ownProps.tx.toJS()) || {};
    const blockchain = tx.blockchain ? blockchainByName(tx.blockchain) : blockchainById(tx.chainId);

    const toAccount = addresses.selectors.find(state, tx.to, blockchain.params.code) || Map({});
    const fromAccount = addresses.selectors.find(state, tx.from, blockchain.params.code) || Map({});

    // TODO: fix it !
    const token = null; //state.tokens.get('tokens').find((t) => t.get('address') === tx.to);

    const showFiat = !token;

    return {
      coinTicker: blockchain.params.coinTicker,
      amountRenderer: txValueRenderer(showFiat),
      lang: i18n.language,
      tx,
      toAccount: toAccount || {},
      fromAccount: fromAccount || {},
      token: (token && token.toJS()) || null,
      netParams: {
        requiredConfirmations: settings.selectors.numConfirms(state),
        currentBlockHeight: blockchains.selectors.getHeight(state, blockchain.params.coinTicker),
      },
    };
  },

  (dispatch, ownProps) => ({
    openTx: () => {
      const { tx } = ownProps;
      dispatch(screen.actions.gotoScreen('transaction', {
        hash: tx.get('hash'),
        accountId: ownProps.accountId,
      }));
    },
    openAccount: (address) => {
      dispatch(Wallet.actions.showAccountDetails(address));
    },
    refreshTx: () => {
      const hash = ownProps.tx.get('hash');
      dispatch(txhistory.actions.refreshTransaction(hash));
    },
  })
)(TxView);
