import * as React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { withStyles } from '@material-ui/core/styles';
import { amber } from '@material-ui/core/colors';
import { Warning } from "@emeraldplatform/ui-icons";
import { FloatProperty } from "csstype";

export interface Props {
  classes?: any;
  status: string;
}

interface State {
  open: boolean;
}

const styles = (theme) => ({
  none: {
  },
  issues: {
    backgroundColor: amber[700],
  },
  disconnected: {
    backgroundColor: theme.palette.error.dark,
  },

  icon: {
    float: "left" as FloatProperty,
    marginRight: "10px",
  },
  message: {
    display: "inline"
  }
});


class ConnectionStatus extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { open: props.open || false };
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) { // eslint-disable-line
    if (nextProps.status) {
      if (nextProps.status === "CONNECTED" || typeof nextProps.status === "undefined") {
        this.setState({ open: false });
      } else {
        this.setState({ open: true });
      }
    }
  }

  render() {
    const { classes } = this.props;
    let message = null;
    let type = "none";
    if (this.props.status === "CONNECTION_ISSUES") {
      message = "Connection issues, please check your Internet connection";
      type = "issues";
    } else if (this.props.status === "DISCONNECTED") {
      message = "Unable to connect to Emerald Services. Please check your Internet connection";
      type = "disconnected";
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
