import React from 'react';
import { connect } from 'react-redux';
import { AccountActionsMenu } from '@emeraldwallet/ui';

// import { api } from 'lib/rpc/api';
import { saveJson } from 'lib/saveAs';
import { screen } from '../../../store';
import history from '../../../store/wallet/history';
import accounts from '../../../store/vault/accounts';

const hasBalance = (account) => (account.get('balance', null) === null)
  || (account.get('balance') && account.get('balance').toWei().gt(0));

export default connect(
  (state, ownProps) => ({
    chain: state.launcher.getIn(['chain', 'name']),
    showPrint: !ownProps.account.get('hardware', false),
    showExport: !ownProps.account.get('hardware', false),
    hiddenAccount: ownProps.account.get('hidden'),
    canHide: !hasBalance(ownProps.account),
  }),
  (dispatch, ownProps) => ({
    onPrint: (chain) => () => {
      const address = ownProps.account.get('id');
      dispatch(screen.actions.gotoScreen('export-paper-wallet', address));
    },
    onHide: (chain) => () => {
      const address = ownProps.account.get('id');
      dispatch(screen.actions.showDialog('hide-account', address));
    },
    onUnhide: (chain) => () => {
      const address = ownProps.account.get('id');
      dispatch(accounts.actions.unhideAccount(address));
      // refresh account data
      dispatch(history.actions.refreshTrackedTransactions());
      dispatch(accounts.actions.loadAccountsList());
      // dispatch(accounts.actions.loadPendingTransactions()); // TODO: do we need it ?

      dispatch(screen.actions.gotoScreen('home'));
    },
    onExport: (chain) => () => {
      const address = ownProps.account.get('id');
      throw Error('NOT IMPLEMEMTED');
      // api.emerald.exportAccount(address, chain).then((result) => {
      //   saveJson(result, `${address}.json`);
      // });
    },
  })
)(AccountActionsMenu);
