import { CircularProgress } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';

const styles = (theme: any) => ({
  inQueue: {
    color: theme.palette && theme.palette.text.secondary
  },
  discarded: {
    color: theme.palette && theme.palette.error.main
  },
  inBlockchain: {
    color: theme.palette && theme.palette.primary.main
  },
  confirmed: {
    color: theme.palette && theme.palette.primary.main
  },
  timestamp: {
    color: theme.palette && theme.palette.text.secondary,
    fontSize: '12px'
  }
});

interface IStatusProps {
  currentBlockHeight: number;
  txBlockNumber: number | null;
  txTimestamp: any;
  txSince: Date;
  txDiscarded: boolean;
  requiredConfirmations: number;
  timeStampFormatter?: (ts: any) => string;
  classes: any;
  onClick?: any;
}

export const Status = (props: IStatusProps) => {
  const { classes, onClick } = props;
  const tsFormatter = props.timeStampFormatter || defaultTimestampFormatter;
  const { currentBlockHeight, txBlockNumber, requiredConfirmations, txDiscarded } = props;

  // Status = Discarded
  if (txDiscarded) {
    return (
      <div>
        <div className={classes.discarded} onClick={onClick}>Discarded</div>
        <div className={classes.timestamp} onClick={onClick}>{tsFormatter(props.txSince)}</div>
      </div>
    );
  }

  // Status = In Queue
  if (!txBlockNumber) {
    return (
      <div>
        <div className={classes.inQueue} onClick={onClick}>
          <CircularProgress color='secondary' size={15} thickness={1.5}/> In Queue
        </div>
        <div className={classes.timestamp} onClick={onClick}>{tsFormatter(props.txSince)}</div>
      </div>
    );
  }

  // Status = In Blockchain
  const numConfirmed = Math.max(currentBlockHeight - txBlockNumber, 0);
  const confirmationBlockNumber = txBlockNumber + requiredConfirmations;

  if (confirmationBlockNumber > currentBlockHeight) {
    return (
      <div>
        <div className={classes.inBlockchain} onClick={onClick}>Success</div>
        <div
          style={{ fontSize: '9px', textAlign: 'center' }}
          onClick={onClick}
        >
          {numConfirmed} / {requiredConfirmations}
        </div>
      </div>
    );
  } else if (confirmationBlockNumber <= currentBlockHeight) {
    return (
      <div>
        <span className={classes.confirmed} onClick={onClick}>Success</span> <br />
        <span className={classes.timestamp} onClick={onClick}>{tsFormatter(props.txTimestamp)}</span>
      </div>
    );
  }

  return null;
};

function defaultTimestampFormatter (timestamp: any): string {
  return timestamp;
}

export default withStyles(styles)(Status);
