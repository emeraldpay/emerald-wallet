import React from 'react';
import { connect } from 'react-redux';

import WaitForSign from '../../components/tx/WaitForSignDialog/waitForSignDialog';
import ReceiveDialog from '../../components/accounts/ReceiveDialog';
import createLogger from '../../utils/logger';
import TokensDialog from '../../components/tokens/TokensDialog';
import HideAccountDialog from '../../components/accounts/HideAccountDialog';
import WalletHistory from '../../store/wallet/history';
import accounts from '../../store/vault/accounts';
import { closeDialog } from '../../store/wallet/screen/screenActions';

const log = createLogger('Dialog');

const Dialog = ({ dialog, item, handleClose }) => {
  if (!dialog) {
    return <div/>;
  } else if (dialog === 'sign-transaction') {
    return <WaitForSign/>;
  } else if (dialog === 'receive') {
    return <ReceiveDialog account={ item } onClose= { handleClose }/>;
  } else if (dialog === 'tokens') {
    return <TokensDialog onClose={ handleClose } />;
  } else if (dialog === 'hide-account') {
    return <HideAccountDialog address={ item } onClose={ handleClose } />;
  }
  log.error('Unsupported dialog', dialog);
  return <div/>;
};

export default connect(
  (state, ownProps) => ({
    dialog: state.wallet.screen.get('dialog'),
    item: state.wallet.screen.get('dialogItem'),
  }),
  (dispatch, ownProps) => ({
    handleClose: () => {
      // refresh data when dialogs close
      dispatch(WalletHistory.actions.refreshTrackedTransactions());
      dispatch(accounts.actions.loadAccountsList());
      dispatch(accounts.actions.loadPendingTransactions());

      dispatch(closeDialog());
    },
  })
)(Dialog);
