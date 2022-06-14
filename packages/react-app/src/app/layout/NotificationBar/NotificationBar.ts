import { IState, screen } from '@emeraldwallet/store';
import { NotificationBar } from '@emeraldwallet/ui';
import { connect } from 'react-redux';

export default connect(
  (state: IState) => {
    return screen.selectors.getNotification(state);
  },
  (dispatch) => ({
    onActionClick(action: any) {
      dispatch(action);
    },
    onRequestClose() {
      dispatch(screen.actions.closeNotification());
    },
  }),
)(NotificationBar);
