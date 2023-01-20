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
  onClose(): void;
}

const Dialog: React.FC<StateProps & DispatchProps> = ({ dialog, onClose }) => {
  if (dialog == null) {
    return <></>;
  }

  switch (dialog) {
    case EmeraldDialogs.ABOUT:
      return <AboutDialog onClose={onClose} />;
    case EmeraldDialogs.SIGN_TX:
      return <WaitForSignDialog onClose={onClose} />;
    default:
      throw new Error(`Unsupported dialog: ${dialog}`);
  }
};

export default connect<StateProps, DispatchProps, unknown, IState>(
  (state) => screen.selectors.getCurrentDialog(state),
  (dispatch) => ({
    onClose() {
      dispatch(screen.actions.closeDialog());
    },
  }),
)(Dialog);
