import React from 'react';
import { connect } from 'react-redux';
import { ReceiveDialog } from '@emeraldwallet/ui';
import WaitForSign from '../../components/tx/WaitForSignDialog/waitForSignDialog';
import createLogger from '../../utils/logger';
import TokensDialog from '../../components/tokens/TokensDialog';
import HideAccountDialog from '../../components/accounts/HideAccountDialog';
import WalletHistory from '../../store/wallet/history';
import accounts from '../../store/vault/accounts';
import { screen } from '../../store';

const log = createLogger('Dialog');

const Dialog = ({ dialog, item, handleClose }) => {
  if (!dialog) {
    return <div/>;
  } if (dialog === 'sign-transaction') {
    return <WaitForSign/>;
  } if (dialog === 'receive') {
    return <ReceiveDialog address={ item } onClose= { handleClose }/>;
  } if (dialog === 'tokens') {
    return <TokensDialog onClose={ handleClose } />;
  } if (dialog === 'hide-account') {
    return <HideAccountDialog address={ item } onClose={ handleClose } />;
  }
  log.error('Unsupported dialog', dialog);
  return <div/>;
};

export default connect(
  (state, ownProps) => ({
    dialog: state.screen.get('dialog'),
    item: state.screen.get('dialogItem'),
  }),
  (dispatch, ownProps) => ({
    handleClose: () => {
      // TODO: do we need it ? -  refresh data when dialogs close
      // dispatch(WalletHistory.actions.refreshTrackedTransactions());
      // dispatch(accounts.actions.loadAccountsList());
      // dispatch(accounts.actions.loadPendingTransactions());

      dispatch(screen.actions.closeDialog());
    },
  })
)(Dialog);
