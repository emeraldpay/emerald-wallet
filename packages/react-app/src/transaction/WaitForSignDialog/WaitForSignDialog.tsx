import { screen } from '@emeraldwallet/store';
import { Button } from '@emeraldwallet/ui';
import { CircularProgress, Dialog, DialogActions, DialogContent } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';

interface IProps {
  open: any;
  handleClose: any;
}

const WaitForSignDialog = ({ open, handleClose }: IProps) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <DialogContent>
        Please sign transaction using your Hardware Key<br/>

        <CircularProgress size={25} />Waiting for signature....
      </DialogContent>
      <DialogActions>
        <Button key='cancel' label='Cancel' primary={true} onClick={handleClose} />
      </DialogActions>
    </Dialog>
  );
};

export default connect(
  (state, ownProps) => {
    const dlg = screen.selectors.getCurrentDialog(state);
    return {
      open: dlg.dialog === 'sign-transaction',
      transaction: dlg.dialogItem
    };
  },
  (dispatch, ownProps) => ({
    handleClose: () => {
      dispatch(screen.actions.closeDialog());
    }
  })
)(WaitForSignDialog);
