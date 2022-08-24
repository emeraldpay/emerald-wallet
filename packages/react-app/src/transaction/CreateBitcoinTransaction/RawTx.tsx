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
  rawtx: string;
}

const Component: React.FC<OwnProps> = ({ rawtx }) => {
  const styles = useStyles();
  return (
    <Box>
      <TextField
        classes={{ root: styles.fieldRoot }}
        label="Raw Tx"
        value={rawtx}
        multiline={true}
        rows={4}
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        InputProps={{
          classes: {
            input: styles.value,
          },
        }}
        variant="outlined"
      />
    </Box>
  );
};

export default Component;
