import { StyleRules, Theme, WithStyles } from '@material-ui/core';
import { amber } from '@material-ui/core/colors';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { Warning } from '../../../icons';

const styles = (theme: Theme): StyleRules =>
  createStyles({
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
  });

export interface StateProps {
  status: string;
}

type Props = StateProps & WithStyles<typeof styles>;

class ConnectionStatus extends React.Component<Props> {
  public render(): React.ReactElement {
    const { classes, status } = this.props;

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
  }
}

export default withStyles(styles)(ConnectionStatus);
