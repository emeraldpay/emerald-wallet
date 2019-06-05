import React from 'react';
import { connect } from 'react-redux';
import { NotificationBar } from '@emeraldwallet/ui';
import { screen } from 'store';

export default connect(
  (state, ownProps) => {
    return screen.selectors.getNotification(state);
  },
  (dispatch, ownProps) => ({
    onRequestClose: () => {
      dispatch(screen.actions.closeNotification());
    },
    onActionClick: (action) => {
      dispatch(action);
    },
  })
)(NotificationBar);
