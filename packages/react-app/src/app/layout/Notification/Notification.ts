import { IState, screen } from '@emeraldwallet/store';
import { Notification, NotificationDispatchProps, NotificationOwnProps } from '@emeraldwallet/ui';
import { connect } from 'react-redux';

export default connect<NotificationOwnProps, NotificationDispatchProps, unknown, IState>(
  (state: IState) => {
    const notificationData = screen.selectors.getNotification(state);

    return { ...notificationData, open: notificationData.notificationDuration != null };
  },
  (dispatch) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onButtonClick(action: any) {
      dispatch(action);
    },
    onClose(reason) {
      dispatch(screen.actions.closeNotification(reason));
    },
  }),
)(Notification);
