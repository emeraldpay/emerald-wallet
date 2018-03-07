// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import launcher from '../../../../store/launcher';
import accounts from '../../../../store/vault/accounts';
import wallet from '../../../../store/wallet';
import screen from '../../../../store/wallet/screen';
import { refreshTransaction } from '../../../../store/wallet/history/historyActions';

import { TxView } from './TxView';

export default connect(
  (state, ownProps) => {
    const getAccount = (addr) => {
      const acc = accounts.selectors.selectAccount(state, addr);
      return acc || Map({});
    };

    const toAccount = getAccount(ownProps.tx.get('to'));
    const fromAccount = getAccount(ownProps.tx.get('from'));

    return {
      showFiat: launcher.selectors.getChainName(state).toLowerCase() === 'mainnet',
      network: state.network.toJS(),
      tx: ownProps.tx,
      toAccount,
      fromAccount,
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
      dispatch(refreshTransaction(hash));
    },
  })
)(TxView);

