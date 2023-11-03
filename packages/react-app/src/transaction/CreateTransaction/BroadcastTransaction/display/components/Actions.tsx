import { Button, ButtonGroup, FormRow } from '@emeraldwallet/ui';
import { createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles(() =>
  createStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
  }),
);

interface OwnProps {
  onBroadcast(): void;
  onCancel(): void;
}

export const Actions: React.FC<OwnProps> = ({ onBroadcast, onCancel }) => {
  const styles = useStyles();

  return (
    <FormRow last>
      <ButtonGroup classes={{ container: styles.buttons }}>
        <Button label="Cancel" onClick={onCancel} />
        <Button primary label="Send" onClick={onBroadcast} />
      </ButtonGroup>
    </FormRow>
  );
};
