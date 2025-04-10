import { PersistentState } from '@emeraldwallet/core';
import {
  CheckCircle as CheckIcon,
  RemoveCircle as DropIcon,
  Error as ErrorIcon,
  Forward as ForwardIcon,
  QueryBuilder as QueryBuilderIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import classNames from 'classnames';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';
const { State, Status } = PersistentState;

const useStyles = makeStyles()((theme) => ({
    block: {
      alignItems: 'center',
      display: 'flex',
      fontFamily: theme.typography.fontFamily,
    },
    error: {
      color: theme.palette.error.main,
    },
    info: {
      color: theme.palette.info.main,
    },
    success: {
      color: theme.palette.success.main,
    },
    warning: {
      color: theme.palette.warning.main,
    },
  }
));

interface OwnProps {
  state?: PersistentState.State;
  status?: PersistentState.Status;
}

export const TxStatus: React.FC<OwnProps> = ({ state, status }) => {
  const classes = useStyles().classes;

  if (status === Status.FAILED) {
    return (
      <div className={classNames(classes.block, classes.error)}>
        <ErrorIcon />
        &nbsp;Failed
      </div>
    );
  }

  switch (state) {
    case State.PREPARED:
      return (
        <div className={classNames(classes.block, classes.info)}>
          <QueryBuilderIcon />
          &nbsp;Prepared
        </div>
      );
    case State.SUBMITTED:
      return (
        <div className={classNames(classes.block, classes.info)}>
          <ForwardIcon />
          &nbsp;Submitted
        </div>
      );
    case State.REPLACED:
      return (
        <div className={classNames(classes.block, classes.warning)}>
          <WarningIcon />
          &nbsp;Replaced
        </div>
      );
    case State.CONFIRMED:
      return (
        <div className={classNames(classes.block, classes.success)}>
          <CheckIcon />
          &nbsp;Confirmed
        </div>
      );
    case State.DROPPED:
      return (
        <div className={classNames(classes.block, classes.error)}>
          <DropIcon />
          &nbsp;Dropped
        </div>
      );
    default:
      return <>Unknown status</>;
  }
};
