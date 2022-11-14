import { Theme } from '@emeraldwallet/ui';
import { Box, TextField, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';

const useStyles = makeStyles<typeof Theme>((theme) =>
  createStyles({
    fieldRoot: {
      border: 0,
    },
    value: {
      fontSize: '12px',
      ...theme.monotype,
    },
  }),
);

interface OwnProps {
  rawTx: string;
}

const RawTx: React.FC<OwnProps> = ({ rawTx }) => {
  const styles = useStyles();
  return (
    <Box>
      <TextField
        fullWidth
        multiline
        classes={{ root: styles.fieldRoot }}
        label="Raw Tx"
        minRows={4}
        value={rawTx}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          classes: {
            input: styles.value,
          },
        }}
      />
    </Box>
  );
};

export default RawTx;
