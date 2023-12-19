import { Button, FormLabel, FormRow } from '@emeraldwallet/ui';
import { TextField, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
    raw: {
      ...theme.monotype,
      fontSize: 12,
    },
  }),
);

interface OwnProps {
  raw: string;
}

export const RawTx: React.FC<OwnProps> = ({ raw }) => {
  const styles = useStyles();

  const [showRaw, setShowRaw] = React.useState(false);

  if (showRaw) {
    return (
      <>
        <FormRow>
          <FormLabel top>Raw Tx</FormLabel>
          <TextField
            fullWidth
            multiline
            disabled
            minRows={4}
            value={raw}
            InputProps={{
              classes: {
                input: styles.raw,
              },
            }}
          />
        </FormRow>
        <FormRow>
          <FormLabel />
          <Button label="Hide Raw" variant="outlined" onClick={() => setShowRaw(false)} />
        </FormRow>
      </>
    );
  }

  return (
    <FormRow>
      <FormLabel>Raw Tx</FormLabel>
      <Button label="Show Raw" variant="outlined" onClick={() => setShowRaw(true)} />
    </FormRow>
  );
};
