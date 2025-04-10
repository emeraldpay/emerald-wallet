import { Button, Snackbar, SnackbarCloseReason, SnackbarContent } from '@mui/material';
import { Alert } from '@mui/lab';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import { AnyAction } from 'redux';

const useStyles = makeStyles()({
  container: {
    maxWidth: 580,
  },
  content: {
    background: 'inherit',
    border: 'none',
    boxShadow: 'none',
    color: 'inherit',
    flexDirection: 'column',
    padding: 0,
  },
  contentMessage: {
    padding: 0,
  },
  contentAction: {
    alignSelf: 'flex-end',
    margin: 0,
    paddingLeft: 0,
    paddingTop: 8,
  },
});

export interface OwnProps {
  open?: boolean;
  notificationMessage?: string;
  notificationMessageType?: 'info' | 'success' | 'warning' | 'error';
  notificationDuration?: number | null;
  notificationButtonText?: string;
  notificationOnButtonClick?: AnyAction;
}

export interface DispatchProps {
  onButtonClick(action: AnyAction): void;
  onClose(reason: SnackbarCloseReason | 'manual'): void;
}

type Props = OwnProps & DispatchProps;

const Notification: React.FC<Props> = ({
  open,
  notificationMessage,
  notificationMessageType,
  notificationDuration,
  notificationButtonText,
  notificationOnButtonClick,
  onButtonClick,
  onClose
}) => {
  const { classes } = useStyles();

  const onActionClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    event.stopPropagation();

    if (notificationOnButtonClick != null) {
      onButtonClick(notificationOnButtonClick);
    }

    onClose('manual');
  };

  let action: React.ReactNode;

  if (notificationButtonText != null) {
    action = (
      <Button color="inherit" size="small" onClick={onActionClick}>
        {notificationButtonText}
      </Button>
    );
  }

  return (
    <Snackbar
      classes={{ root: classes.container }}
      open={open}
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      autoHideDuration={(notificationDuration ?? 3) * 1000}
      onClose={(event, reason) => onClose(reason)}
    >
      <Alert onClose={() => onClose('manual')} severity={notificationMessageType ?? 'info'}>
        <SnackbarContent
          classes={{
            root: classes.content,
            message: classes.contentMessage,
            action: classes.contentAction,
          }}
          action={action}
          message={notificationMessage}
        />
      </Alert>
    </Snackbar>
  );
};

export default Notification;
