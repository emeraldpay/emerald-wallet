import { Dialog, DialogActions, DialogContent } from '@material-ui/core';
import * as React from 'react';
import Button from '../Button';

export interface StateProps {
  error?: Error | null;
  message?: string;
  open?: boolean;
}

export interface DispatchProps {
  handleClose(): void;
  handleSubmit(error: Error): void;
}

const ErrorDialog: React.FC<StateProps & DispatchProps> = ({ error, message, open, handleClose, handleSubmit }) => (
  <Dialog open={open} onClose={handleClose}>
    <DialogContent>
      <p>
        <strong>ERROR:</strong> An unexpected error has occurred. Please restart & update emerald wallet.
      </p>
      <p>The error was: {message}</p>
    </DialogContent>
    <DialogActions>
      <Button label="Submit A Bug Ticket" primary={false} onClick={() => handleSubmit(error)} />
      <Button label="Close" primary={true} onClick={handleClose} />
    </DialogActions>
  </Dialog>
);

export default ErrorDialog;
