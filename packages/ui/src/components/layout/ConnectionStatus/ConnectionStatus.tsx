import { Warning } from '@emeraldplatform/ui-icons';
import { amber } from '@material-ui/core/colors';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';

export interface IProps {
  classes?: any;
  status: string;
}

interface IState {
  open: boolean;
}

const styles = (theme) => createStyles({
  none: {
  },
  issues: {
    backgroundColor: amber[700]
  },
  disconnected: {
    backgroundColor: theme.palette.error.dark
  },

  icon: {
    float: 'left',
    marginRight: '10px'
  },
  message: {
    display: 'inline'
  }
});

class ConnectionStatus extends React.Component<IProps, IState> {
  constructor (props) {
    super(props);
    this.state = { open: props.open || false };
  }

  public UNSAFE_componentWillReceiveProps (nextProps: IProps) {
    if (nextProps.status) {
      if (nextProps.status === 'CONNECTED' || typeof nextProps.status === 'undefined') {
        this.setState({ open: false });
      } else {
        this.setState({ open: true });
      }
    }
  }

  public render () {
    const { classes } = this.props;
    let message = null;
    let type = 'none';
    if (this.props.status === 'CONNECTION_ISSUES') {
      message = 'Connection issues, please check your Internet connection';
      type = 'issues';
    } else if (this.props.status === 'DISCONNECTED') {
      message = 'Unable to connect to Emerald Services. Please check your Internet connection';
      type = 'disconnected';
    }
    return (
      <Snackbar
        open={this.state.open}
      >
        <SnackbarContent
          className={classes[type]}
          message={<span><Warning className={classes.icon}/><span className={classes.message}>{message}</span></span>}
        />
      </Snackbar>
    );
  }
}

export default withStyles(styles)(ConnectionStatus);
