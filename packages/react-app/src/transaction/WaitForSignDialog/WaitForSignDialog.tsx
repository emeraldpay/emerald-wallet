import { Button } from '@emeraldwallet/ui';
import { CircularProgress, Dialog, DialogActions, DialogContent } from '@material-ui/core';
import * as React from 'react';

interface OwnProps {
  onClose(): void;
}

const WaitForSignDialog: React.FC<OwnProps> = ({ onClose }) => {
  return (
    <Dialog open={true} onClose={onClose}>
      <DialogContent>
        Please sign transaction using your Hardware Key
        <br />
        <CircularProgress size={25} />
        Waiting for signature....
      </DialogContent>
      <DialogActions>
        <Button primary label="Cancel" onClick={onClose} />
      </DialogActions>
    </Dialog>
  );
};

export default WaitForSignDialog;
