import { workflow } from '@emeraldwallet/core';
import { Button, ButtonGroup, FormRow } from '@emeraldwallet/ui';
import { CircularProgress, FormLabel } from '@mui/material';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
  }
);

interface OwnProps {
  createTx: workflow.AnyCreateTx;
  disabled?: boolean;
  initializing: boolean;
  onCancel(): void;
  onCreate(): void;
}

export const Actions: React.FC<OwnProps> = ({ createTx, initializing, disabled = false, onCancel, onCreate }) => {
  const styles = useStyles().classes;

  return (
    <FormRow last>
      <FormLabel />
      <ButtonGroup classes={{ container: styles.buttons }}>
        {initializing && (
          <Button disabled icon={<CircularProgress size={16} />} label="Checking the network" variant="text" />
        )}
        <Button label="Cancel" onClick={onCancel} />
        <Button
          primary
          disabled={disabled || initializing || createTx.validate() !== workflow.ValidationResult.OK}
          label="Create Transaction"
          onClick={onCreate}
        />
      </ButtonGroup>
    </FormRow>
  );
};
