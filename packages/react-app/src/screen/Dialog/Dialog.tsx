import { ReceiveDialog } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import HideAccountDialog from '../../accounts/HideAccountDialog';
import WaitForSignDialog from '../../transaction/WaitForSignDialog';
import { screen } from '@emeraldwallet/store';

export enum EmeraldDialogs {
  SIGN_TX = 'sign-transaction',
  DEPOSIT = 'receive',
  HIDE_ACCOUNT = 'hide-account'
}

interface IProps {
  dialog: any;
  dialogItem: any;
  handleClose?: any;
}

const Dialog = ({ dialog, dialogItem, handleClose }: IProps) => {
  if (!dialog) {
    return <div/>;
  }
  if (dialog === EmeraldDialogs.SIGN_TX) {
    return <WaitForSignDialog/>;
  }
  if (dialog === EmeraldDialogs.DEPOSIT) {
    return <ReceiveDialog address={dialogItem} onClose={handleClose}/>;
  }
  if (dialog === EmeraldDialogs.HIDE_ACCOUNT) {
    return <HideAccountDialog account={dialogItem} onClose={handleClose} />;
  }
  throw new Error(`Unsupported dialog: ${dialog}`);
};

export default connect(
  (state, ownProps) => screen.selectors.getCurrentDialog(state),
  (dispatch, ownProps) => ({
    handleClose: () => {
      dispatch(screen.actions.closeDialog());
    }
  })
)(Dialog);
