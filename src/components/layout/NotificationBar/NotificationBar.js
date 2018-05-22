import React from 'react';
import { connect } from 'react-redux';
import Snackbar from 'material-ui/Snackbar';
import { orange300 } from 'material-ui/styles/colors';
import screen from 'store/wallet/screen';
import muiThemeable from 'material-ui/styles/muiThemeable';


class NotificationBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.notificationMessage) {
      this.setState({ open: true });
    } else {
      this.setState({ open: false });
    }
  }

  render() {
    const { muiTheme } = this.props;
    const colors = {
      success: muiTheme.palette.primary1Color,
      error: muiTheme.palette.accent1Color,
      info: muiTheme.palette.textColor,
      warning: orange300,
    };
    return (
      <Snackbar
        bodyStyle={{
          backgroundColor: muiTheme.palette.alternateTextColor,
          boxShadow: `${muiTheme.palette.shadowColor} 0px 0px 50px 0px`,
        }}
        contentStyle={{
          color: colors[this.props.notificationType],
        }}
        style={{
          bottom: 'auto',
          top: '-55px',
          left: 'auto',
          right: 0,
          transform: this.state.open ? 'translate3d(0, 85px, 0)' : 'translate3d(0, 0, 0)',
        }}
        open={this.state.open}
        message={this.props.notificationMessage || ''}
        autoHideDuration={this.props.notificationDuration || 3000}
        onRequestClose={this.props.onRequestClose}
      />
    );
  }
}


export default connect(
  (state, ownProps) => ({
    notificationMessage: state.wallet.screen.get('notificationMessage'),
    notificationDuration: state.wallet.screen.get('notificationDuration'),
    notificationType: state.wallet.screen.get('notificationType'),
  }),
  (dispatch, ownProps) => ({
    onRequestClose: () => {
      dispatch(screen.actions.closeNotification());
    },
  })
)(muiThemeable()(NotificationBar));
