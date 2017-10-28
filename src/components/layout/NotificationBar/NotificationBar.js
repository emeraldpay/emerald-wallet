import React from 'react';
import { connect } from 'react-redux';
import Snackbar from 'material-ui/Snackbar';

class NotificationBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = { open: false }
  }

 componentWillReceiveProps(nextProps) {
    if (nextProps.notificationMessage) {
      this.setState({ open: true })
    } else {
      this.setState({ open: false })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Only re-render when snackbar is going from closed to open
    return !this.state.open && nextState.open;
  }

  render() {
    return (
        <Snackbar
            open={this.state.open}
            message={this.props.notificationMessage || ''}
            autoHideDuration={3000}
        />
    );
  }
}



export default connect(
    (state, ownProps) => ({
        notificationMessage: state.wallet.screen.get('notificationMessage')
    })
)(NotificationBar);
