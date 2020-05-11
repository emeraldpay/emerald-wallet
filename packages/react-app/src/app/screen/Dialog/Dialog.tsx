import { screen } from '@emeraldwallet/store';
import { ReceiveDialog } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import WaitForSignDialog from '../../../transaction/WaitForSignDialog';
import AboutDialog from '../../AboutDialog';

export enum EmeraldDialogs {
  SIGN_TX = 'sign-transaction',
  DEPOSIT = 'receive',
  ABOUT = 'about'
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
  if (dialog === EmeraldDialogs.ABOUT) {
    return (<AboutDialog handleClose={handleClose}/>);
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
