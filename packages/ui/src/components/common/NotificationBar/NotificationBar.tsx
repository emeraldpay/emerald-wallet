import orange from '@material-ui/core/colors/orange';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import * as React from 'react';

export interface Props {
  onActionClick?: any;
  onRequestClose?: any;
  notificationActionToDispatchOnActionClick?: any;
  notificationMessage?: any;
  notificationDuration?: any;
  notificationActionText?: any;
  notificationType?: any;
  classes?: any;
  open?: boolean;
}

interface State {
  open: boolean;
}

const styles = (theme) => ({
  success: { color: theme.palette.primary.main },
  error: { color: '#F41A2D' },
  info: { color: theme.palette.text.primary },
  warning: { color: orange[300] },
  common: {
    backgroundColor: theme.palette.background.default,
    boxShadow: `${theme.palette.secondary.main} 0px 0px 50px 0px`
  }
});

export class NotificationBar extends React.Component<Props, State> {
  constructor (props) {
    super(props);
    this.state = { open: props.open || false };
    this.onActionClick = this.onActionClick.bind(this);
  }

  public UNSAFE_componentWillReceiveProps (nextProps) { // eslint-disable-line
    if (nextProps.notificationMessage) {
      this.setState({ open: true });
    } else {
      this.setState({ open: false });
    }
  }

  public onActionClick () {
    this.props.onActionClick(this.props.notificationActionToDispatchOnActionClick);
  }

  public render () {
    const { classes } = this.props;
    // const colors = {
    //   success: muiTheme.palette.primary1Color,
    //   error: muiTheme.palette.accent1Color,
    //   info: muiTheme.palette.textColor,
    //   warning: orange[300],
    // };
    return (
      <Snackbar
        // bodyStyle={{
        //   backgroundColor: muiTheme.palette.alternateTextColor,
        //   boxShadow: `${muiTheme.palette.shadowColor} 0px 0px 50px 0px`,
        // }}
        // contentStyle={{
        //   color: colors[this.props.notificationType],
        // }}
        style={{
          bottom: 'auto',
          top: '-55px',
          left: 'auto',
          right: 0,
          transform: this.state.open ? 'translate3d(0, 85px, 0)' : 'translate3d(0, 0, 0)'
        }}
        open={this.state.open}
        autoHideDuration={this.props.notificationDuration || 3000}
        onClose={this.props.onRequestClose}
        action={this.props.notificationActionText}
        onClick={this.onActionClick}
      >
        <SnackbarContent
          className={classNames(classes[this.props.notificationType], classes.common)}
          message={this.props.notificationMessage || ''}
        />
      </Snackbar>
    );
  }
}

export default withStyles(styles)(NotificationBar);
