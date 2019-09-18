import { CircularProgress } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';

const styles = (theme: any) => ({
  inQueue: {
    color: theme.palette && theme.palette.text.secondary
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

interface Props {
  currentBlockHeight: number;
  txBlockNumber: number | null;
  txTimestamp: any;
  requiredConfirmations: number;
  timeStampFormatter?: (ts: any) => string;
  classes: any;
  onClick?: any;
}

const Status = (props: Props) => {
  const { classes, onClick } = props;
  const tsFormatter = props.timeStampFormatter || defaultTimestampFormatter;
  const { currentBlockHeight, txBlockNumber, requiredConfirmations } = props;

  // Status = In Queue
  if (!txBlockNumber) {
    return (
      <span className={classes.inQueue} onClick={onClick}>
        <CircularProgress color='secondary' size={15} thickness={1.5}/> In Queue
      </span>);
  }

  // Status = In Blockchain
  const numConfirmed = Math.max(currentBlockHeight - txBlockNumber, 0);
  const confirmationBlockNumber = txBlockNumber + requiredConfirmations;

  if (confirmationBlockNumber > currentBlockHeight) {
    return (
      <div>
        <div className={classes.inBlockchain} onClick={onClick}>Success</div>
        <div style={{ fontSize: '9px', textAlign: 'center' }} onClick={onClick}>{numConfirmed} / {requiredConfirmations}</div>
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

const StyledStatus = withStyles(styles)(Status);
export default StyledStatus;
