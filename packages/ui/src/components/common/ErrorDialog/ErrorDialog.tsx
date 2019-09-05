import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '../Button';

export interface Props {
  open?: boolean;
  error?: any;
  message?: any;
  handleClose?: any;
  handleSubmit?: any;
}

const ErrorDialog = ({
  open, error, message, handleClose, handleSubmit,
}: Props) => {
  return (
    <Dialog
      open={open ? open: false}
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
          label="Submit A Bug Ticket"
          primary={false}
          onClick={() => handleSubmit(error)}
        />
        <Button
          // key="closeButton"
          label="Close"
          primary={true}
          onClick={handleClose}
        />
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;
