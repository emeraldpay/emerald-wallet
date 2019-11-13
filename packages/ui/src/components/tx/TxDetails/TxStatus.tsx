import { CircularProgress } from '@material-ui/core';
import { CheckCircle, Error } from '@material-ui/icons';
import { CSSProperties, withStyles } from '@material-ui/styles';
import * as React from 'react';

export const styles = {
  success: {
    height: '30px',
    width: '117px',
    color: '#47B04B',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '16px',
    display: 'flex',
    alignItems: 'center'
  },
  queue: {
    height: '30px',
    width: '117px',
    color: '#747474',
    fontSize: '14px',
    lineHeight: '22px',
    display: 'flex',
    alignItems: 'center'
  } as CSSProperties,
  discarded: {
    height: '30px',
    width: '117px',
    color: '#a01c1a',
    fontSize: '14px',
    lineHeight: '22px',
    display: 'flex',
    alignItems: 'center'
  } as CSSProperties
};

interface IProps {
  classes?: any;
  status: string;
}

export const TxStatus = (props: IProps) => {
  const { status, classes } = props;
  if (status === 'success') {
    return (
      <div className={classes.success}>
        <CheckCircle />&nbsp; Success
      </div>
    );
  }
  if (status === 'discarded') {
    return (
      <div className={classes.discarded}>
        <Error />&nbsp; Discarded
      </div>
    );
  }
  if (status === 'queue') {
    return (
      <div className={classes.queue}>
        <CircularProgress size={15} thickness={1.5}/>&nbsp; In Queue
      </div>
    );
  }
  return (
    <div>
      Unknown status
    </div>
  );
};

export default withStyles(styles)(TxStatus);
