import React from 'react';
import { connect } from 'react-redux';
import { ReceiveDialog } from '@emeraldwallet/ui';
import WaitForSign from '../../components/tx/WaitForSignDialog/waitForSignDialog';
import createLogger from '../../utils/logger';
import HideAccountDialog from '../../components/accounts/HideAccountDialog';
import { screen } from '../../store';

const log = createLogger('Dialog');

const Dialog = ({ dialog, item, handleClose }) => {
  if (!dialog) {
    return <div/>;
  } if (dialog === 'sign-transaction') {
    return <WaitForSign/>;
  } if (dialog === 'receive') {
    return <ReceiveDialog address={ item } onClose= { handleClose }/>;
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
      dispatch(screen.actions.closeDialog());
    },
  })
)(Dialog);
