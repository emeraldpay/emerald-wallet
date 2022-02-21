import { CircularProgress, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles(
  (theme) => createStyles({
    inQueue: {
      color: theme.palette && theme.palette.text.secondary,
    },
    discarded: {
      color: theme.palette && theme.palette.error.main,
    },
    inBlockchain: {
      color: theme.palette && theme.palette.primary.main,
    },
    confirmed: {
      color: theme.palette && theme.palette.primary.main,
    },
    timestamp: {
      color: theme.palette && theme.palette.text.secondary,
      fontSize: '12px',
    },
  }),
);

interface StatusProps {
  txBlockNumber: number | null;
  txTimestamp: any;
  txSince: Date;
  txDiscarded: boolean;
  timeStampFormatter?: (timestamp: any) => string;
  onClick?: () => void;
}

export const Status: React.FC<StatusProps> = ({
  txBlockNumber,
  txDiscarded,
  txSince,
  txTimestamp,
  onClick,
  timeStampFormatter = (timestamp) => timestamp,
}) => {
  const classes = useStyles();

  // Status = Discarded
  if (txDiscarded) {
    return (
      <div>
        <div className={classes.discarded} onClick={onClick}>Discarded</div>
        <div className={classes.timestamp} onClick={onClick}>{timeStampFormatter(txSince)}</div>
      </div>
    );
  }

  // Status = In Queue
  if (!txBlockNumber) {
    return (
      <div>
        <div className={classes.inQueue} onClick={onClick}>
          <CircularProgress color="secondary" size={15} thickness={1.5} /> In Queue
        </div>
        <div className={classes.timestamp} onClick={onClick}>{timeStampFormatter(txSince)}</div>
      </div>
    );
  }

  // Status = In Blockchain
  return (
    <div>
      <span className={classes.confirmed} onClick={onClick}>Success</span> <br />
      <span className={classes.timestamp} onClick={onClick}>{timeStampFormatter(txTimestamp)}</span>
    </div>
  );
};

export default Status;
