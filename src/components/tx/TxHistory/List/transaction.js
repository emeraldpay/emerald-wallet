// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import launcher from '../../../../store/launcher';
import accounts from '../../../../store/vault/accounts';
import wallet from '../../../../store/wallet';
import screen from '../../../../store/wallet/screen';
import WalletHistory from '../../../../store/wallet/history';

import TxView from './TxView';

export default connect(
  (state, ownProps) => {
    const getAccount = (addr) => {
      const acc = accounts.selectors.selectAccount(state, addr);
      return acc || Map({});
    };

    const toAccount = getAccount(ownProps.tx.get('to'));
    const fromAccount = getAccount(ownProps.tx.get('from'));

    const token = state.tokens.get('tokens').find((t) => t.get('address') === ownProps.tx.get('to'));

    const showFiat = !token && launcher.selectors.getChainName(state).toLowerCase() === 'mainnet';
    return {
      showFiat,
      currentBlockHeight: state.network.getIn(['currentBlock', 'height']),
      tx: ownProps.tx,
      toAccount,
      fromAccount,
      token,
      numConfirmations: state.wallet.settings.get('numConfirmations'),
    };
  },
  (dispatch, ownProps) => ({
    openTx: () => {
      const tx = ownProps.tx;
      dispatch(screen.actions.gotoScreen('transaction', {
        hash: tx.get('hash'),
        accountId: ownProps.accountId,
      })
      );
    },
    openAccount: (address: string) => {
      dispatch(wallet.actions.showAccountDetails(address));
    },
    refreshTx: () => {
      const hash = ownProps.tx.get('hash');
      dispatch(WalletHistory.actions.refreshTransaction(hash));
    },
  })
)(TxView);

