import { IState, screen } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import WaitForSignDialog from '../../../transaction/WaitForSignDialog';
import AboutDialog from '../../AboutDialog';

export enum EmeraldDialogs {
  ABOUT = 'about',
  SIGN_TX = 'sign-transaction',
}

interface StateProps {
  dialog?: EmeraldDialogs;
}

interface DispatchProps {
  handleClose(): void;
}

const Dialog: React.FC<StateProps & DispatchProps> = ({ dialog, handleClose }) => {
  if (dialog == null) {
    return <div />;
  }

  switch (dialog) {
    case EmeraldDialogs.ABOUT:
      return <AboutDialog handleClose={handleClose} />;
    case EmeraldDialogs.SIGN_TX:
      return <WaitForSignDialog />;
    default:
      throw new Error(`Unsupported dialog: ${dialog}`);
  }
};

export default connect<StateProps, DispatchProps, {}, IState>(
  (state) => screen.selectors.getCurrentDialog(state),
  (dispatch) => ({
    handleClose() {
      dispatch(screen.actions.closeDialog());
    },
  }),
)(Dialog);
