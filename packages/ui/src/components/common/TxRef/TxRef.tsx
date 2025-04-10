import { Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

const useStyles = makeStyles()((theme) => ({
  ref: {
    fontSize: 15,
    fontWeight: 500,
    lineHeight: '28px',
    ...theme.monotype,
  },
}));

interface OwnProps {
  txid: string;
  vout?: number;
}

const TxRef: React.FC<OwnProps> = ({ txid, vout }) => {
  const { classes } = useStyles();

  return (
    <Typography className={classes.ref}>
      {txid}
      {vout == null ? '' : `:${vout}`}
    </Typography>
  );
};

export default TxRef;
