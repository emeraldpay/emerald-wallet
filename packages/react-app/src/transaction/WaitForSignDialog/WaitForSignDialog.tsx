import { IState, hwkey, screen } from '@emeraldwallet/store';
import { Button } from '@emeraldwallet/ui';
import { CircularProgress, Dialog, DialogActions, DialogContent } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';

interface OwnProps {
  onClose(): void;
}

interface StateProps {
  open: boolean;
}

interface DispatchProps {
  handleClose(): void;
}

const WaitForSignDialog: React.FC<StateProps & DispatchProps> = ({ open, handleClose }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        Please sign transaction using your Hardware Key
        <br />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CircularProgress size={25} />
          Waiting for signature....
        </div>
      </DialogContent>
      <DialogActions>
        <Button key="cancel" label="Cancel" primary={true} onClick={handleClose} />
      </DialogActions>
    </Dialog>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state) => {
    const { dialog } = screen.selectors.getCurrentDialog(state);

    return { open: dialog === 'sign-transaction' };
  },
  (dispatch, { onClose }) => ({
    handleClose() {
      dispatch(hwkey.actions.setWatch(false));

      onClose();
    },
  }),
)(WaitForSignDialog);
