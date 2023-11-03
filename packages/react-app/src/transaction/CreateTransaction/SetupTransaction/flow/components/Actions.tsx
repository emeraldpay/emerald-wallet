import { workflow } from '@emeraldwallet/core';
import { Button, ButtonGroup, FormRow } from '@emeraldwallet/ui';
import { CircularProgress, FormLabel, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles(
  createStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
  }),
);

interface OwnProps {
  createTx: workflow.AnyCreateTx;
  initializing: boolean;
  onCancel(): void;
  onCreate(): void;
}

export const Actions: React.FC<OwnProps> = ({ createTx, initializing, onCancel, onCreate }) => {
  const styles = useStyles();

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
          disabled={initializing || createTx.validate() !== workflow.ValidationResult.OK}
          label="Create Transaction"
          onClick={onCreate}
        />
      </ButtonGroup>
    </FormRow>
  );
};
