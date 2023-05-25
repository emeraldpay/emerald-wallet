import { IState, screen } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import WalletSettingsDialog from '../../../wallets/WalletSettingsDialog';
import AboutDialog from '../../AboutDialog';

interface StateProps {
  dialog?: screen.Dialogs | null;
  dialogOptions?: unknown;
}

interface DispatchProps {
  onClose(): void;
}

const Dialog: React.FC<StateProps & DispatchProps> = ({ dialog, dialogOptions, onClose }) => {
  if (dialog == null) {
    return <></>;
  }

  switch (dialog) {
    case screen.Dialogs.ABOUT:
      return <AboutDialog onClose={onClose} />;
    case screen.Dialogs.WALLET_SETTINGS:
      return <WalletSettingsDialog walletId={dialogOptions as string} onClose={onClose} />;
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
