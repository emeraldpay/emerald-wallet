import React from 'react';
import { connect } from 'react-redux';
import { NotificationBar } from '@emeraldwallet/ui';
import screen from 'store/wallet/screen';

export default connect(
  (state, ownProps) => ({
    notificationMessage: state.wallet.screen.get('notificationMessage'),
    notificationDuration: state.wallet.screen.get('notificationDuration'),
    notificationType: state.wallet.screen.get('notificationType'),
    notificationActionText: state.wallet.screen.get('notificationActionText'),
    notificationActionToDispatchOnActionClick: state.wallet.screen.get('notificationActionToDispatchOnActionClick'),
  }),
  (dispatch, ownProps) => ({
    onRequestClose: () => {
      dispatch(screen.actions.closeNotification());
    },
    onActionClick: (action) => {
      dispatch(action);
    },
  })
)(NotificationBar);
