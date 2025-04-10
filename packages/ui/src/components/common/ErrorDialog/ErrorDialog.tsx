import { Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
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
  <Dialog open={open || false} onClose={handleClose}>
    <DialogContent>
      <Typography variant={"subtitle1"}>
        <strong>ERROR:</strong> An unexpected error has occurred. Please restart the Emerald Wallet.
      </Typography>
      <Typography variant={"body2"}>The error was: {message}</Typography>
    </DialogContent>
    <DialogActions>
      <Button label="Submit A Bug Ticket" primary={false} onClick={() => handleSubmit(error)} />
      <Button label="Close" primary={true} onClick={handleClose} />
    </DialogActions>
  </Dialog>
);

export default ErrorDialog;
