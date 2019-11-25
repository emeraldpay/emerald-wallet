import { Dialog, DialogActions, DialogContent } from '@material-ui/core';
import * as React from 'react';
import Button from '../Button';

export interface IErrorDialogProps {
  open?: boolean;
  error?: any;
  message?: any;
  handleClose?: any;
  handleSubmit?: any;
}

const ErrorDialog = ({
  open, error, message, handleClose, handleSubmit
}: IErrorDialogProps) => {

  function onSubmit () {
    if (handleSubmit) {
      handleSubmit(error);
    }
  }

  return (
    <Dialog
      open={open ? open : false}
      onClose={handleClose}
    >
      <DialogContent>
      <p>
        <strong>ERROR:</strong> An unexpected error has occurred. Please restart & update emerald wallet.
      </p>
      <p>
        The error was: {message}
      </p>
      </DialogContent>
      <DialogActions>
        <Button
          // key="submitButton"
          label='Submit A Bug Ticket'
          primary={false}
          onClick={onSubmit}
        />
        <Button
          // key="closeButton"
          label='Close'
          primary={true}
          onClick={handleClose}
        />
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;
