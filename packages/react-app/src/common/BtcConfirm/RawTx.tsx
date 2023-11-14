import { Theme } from '@emeraldwallet/ui';
import { TextField, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';

const useStyles = makeStyles<typeof Theme>((theme) =>
  createStyles({
    rawTxText: {
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
    <TextField
      fullWidth
      multiline
      disabled
      minRows={4}
      value={rawTx}
      InputProps={{
        classes: {
          input: styles.rawTxText,
        },
      }}
    />
  );
};

export default RawTx;
