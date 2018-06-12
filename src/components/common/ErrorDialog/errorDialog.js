import React from 'react';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import { Button } from 'emerald-js-ui';

import screen from 'store/wallet/screen';

const ErrorDialog = ({ open, error, message, handleClose, handleSubmit }) => {
  const actions = [
    <Button
      key="submitButton"
      label="Submit A Bug Ticket"
      primary={false}
      onClick={() => handleSubmit(error)}
    />,
    <Button
      key="closeButton"
      label="Close"
      primary={true}
      onClick={handleClose}
    />,
  ];
  return (
    <Dialog
      actions={actions}
      modal={false}
      open={open}
      onRequestClose={handleClose}
    >
      <p>
        <strong>ERROR:</strong> An unexpected error has occured. Please restart & update emerald wallet.
      </p>
      <p>
        The error was: {message}
      </p>
    </Dialog>
  );
};

export default connect(
  (state, ownProps) => {
    let props = {
      open: state.wallet.screen.get('error') !== null,
    };

    if (props.open) {
      props = {
        ...props,
        error: state.wallet.screen.get('error'),
        message: state.wallet.screen.get('error').message,
      };
    }

    return props;
  },
  (dispatch, ownProps) => ({
    handleClose: () => {
      dispatch(screen.actions.closeError());
    },
    handleSubmit: (error) => {
      const title = encodeURIComponent(error.message);
      const body = encodeURIComponent(`\`\`\` \n${error.stack}\n \`\`\``);

      const buttonLink = `https://github.com/ETCDEVTeam/emerald-wallet/issues/new?title=${title}&body=${body}`;

      dispatch(screen.actions.openLink(buttonLink));
    },
  })
)(ErrorDialog);
