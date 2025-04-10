import { amber } from '@mui/material/colors';
import {Snackbar, SnackbarContent} from '@mui/material';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Warning } from '../../../icons';

const useStyles = makeStyles()((theme) => ({
  icon: {
    float: 'left',
    marginRight: 10,
  },
  message: {
    display: 'inline',
  },
  statusConnectionIssues: {
    backgroundColor: amber[700],
  },
  statusDisconnected: {
    backgroundColor: theme.palette.error.dark,
  },
}));

export interface StateProps {
  status: string;
}

type Props = StateProps;

const ConnectionStatus: React.FC<Props> = ({ status }) => {
  const { classes } = useStyles();

  let className: string | undefined;
  let message: string | undefined;

  switch (status) {
    case 'CONNECTION_ISSUES':
      className = classes.statusConnectionIssues;
      message = 'Connection issues, please check your Internet connection';
      break;
    case 'DISCONNECTED':
      className = classes.statusDisconnected;
      message = 'Unable to connect to Emerald Services. Please check your Internet connection';
      break;
  }

  return (
    <Snackbar open={status !== 'CONNECTED'}>
      <SnackbarContent
        className={className}
        message={
          <>
            <Warning className={classes.icon} />
            <span className={classes.message}>{message}</span>
          </>
        }
      />
    </Snackbar>
  );
};

export default ConnectionStatus;
