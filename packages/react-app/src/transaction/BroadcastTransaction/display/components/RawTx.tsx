import { Button, FormLabel, FormRow } from '@emeraldwallet/ui';
import { TextField } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

const useStyles = makeStyles()((theme) => ({
  raw: {
    ...theme.monotype,
    fontSize: 12,
  },
}));

interface OwnProps {
  raw: string;
}

export const RawTx: React.FC<OwnProps> = ({ raw }) => {
  const { classes } = useStyles();

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
                input: classes.raw,
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
