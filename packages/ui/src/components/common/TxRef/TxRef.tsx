import { Theme, Typography, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    ref: {
      fontSize: 15,
      fontWeight: 500,
      lineHeight: '28px',
      ...theme.monotype,
    },
  }),
);

interface OwnProps {
  txid: string;
  vout?: number;
}

const TxRef: React.FC<OwnProps> = ({ txid, vout }) => {
  const styles = useStyles();

  return (
    <Typography className={styles.ref}>
      {txid}
      {vout == null ? '' : `:${vout}`}
    </Typography>
  );
};

export default TxRef;
