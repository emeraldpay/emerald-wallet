import { Snackbar, SnackbarContent, withStyles } from '@material-ui/core';
import orange from '@material-ui/core/colors/orange';
import classNames from 'classnames';
import * as React from 'react';

export interface IBarProps {
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

interface IBarState {
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

export class NotificationBar extends React.Component<IBarProps, IBarState> {
  constructor (props) {
    super(props);
    this.state = { open: props.open || false };
    this.onActionClick = this.onActionClick.bind(this);
  }

  public UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.notificationMessage) {
      this.setState({ open: true });
    } else {
      this.setState({ open: false });
    }
  }

  public onActionClick () {
    const { notificationActionToDispatchOnActionClick: action } = this.props;

    if (action != null) {
      this.props.onActionClick(action);
    }
  }

  public render () {
    const { classes } = this.props;
    return (
      <Snackbar
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
