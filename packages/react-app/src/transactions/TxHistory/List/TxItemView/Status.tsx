import { CircularProgress, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
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
  })
);

interface StatusProps {
  txBlockNumber: number | null;
  txTimestamp: any;
  txSince: Date;
  txDiscarded: boolean;
  txTotalRetries: number;
  timeStampFormatter?: (timestamp: any) => string;
  onClick?: () => void;
}

export const Status: React.FC<StatusProps> = ({
  txBlockNumber,
  txDiscarded,
  txSince,
  txTimestamp,
  txTotalRetries,
  onClick,
  timeStampFormatter = (timestamp) => timestamp,
}) => {
  const classes = useStyles();

  // Status = Discarded
  if (txDiscarded) {
    return (
      <>
        <div className={classes.discarded} onClick={onClick}>
          Discarded
        </div>
        <div className={classes.timestamp} onClick={onClick}>
          {timeStampFormatter(txSince)}
        </div>
      </>
    );
  }

  // Status = In Queue / Not executed
  if (!txBlockNumber) {
    const notExecuted =
      txTotalRetries === 10 ||
      txSince.getTime() < new Date().getTime() - 7 * 24 * 60 * 60 * 1000;

    if (notExecuted) {
      // Status = Not executed
      return (
        <>
          <div className={classes.discarded} onClick={onClick}>
            Not executed
          </div>
          <div className={classes.timestamp} onClick={onClick}>
            {timeStampFormatter(txSince)}
          </div>
        </>
      );
    }

    // Status = In Queue
    return (
      <>
        <div className={classes.inQueue} onClick={onClick}>
          <CircularProgress
            color="secondary"
            size={15}
            thickness={1.5}
            style={{ marginRight: 5 }}
          />
          In Queue
        </div>
        <div className={classes.timestamp} onClick={onClick}>
          {timeStampFormatter(txSince)}
        </div>
      </>
    );
  }

  // Status = In Blockchain
  return (
    <>
      <div className={classes.confirmed} onClick={onClick}>
        Success
      </div>
      <div className={classes.timestamp} onClick={onClick}>
        {timeStampFormatter(txTimestamp)}
      </div>
    </>
  );
};

export default Status;
