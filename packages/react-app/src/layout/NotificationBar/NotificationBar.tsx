import { screen } from '@emeraldwallet/store';
import { NotificationBar } from '@emeraldwallet/ui';
import { connect } from 'react-redux';

export default connect(
  (state, ownProps) => {
    return screen.selectors.getNotification(state);
  },
  (dispatch, ownProps) => ({
    onRequestClose: () => {
      dispatch(screen.actions.closeNotification());
    },
    onActionClick: (action: any) => {
      dispatch(action);
    }
  })
)(NotificationBar);
