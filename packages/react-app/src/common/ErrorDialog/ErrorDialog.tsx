import * as React from 'react';
import { connect } from 'react-redux';
import { ErrorDialog } from '@emeraldwallet/ui';
import { screen } from '@emeraldwallet/store';

export default connect(
  (state: any, ownProps) => {
    let props: { open: boolean; error?: any; message?: any } = {
      open: screen.selectors.getError(state) !== null,
    };
    if (props.open) {
      const err: any = screen.selectors.getError(state);
      props = {
        ...props,
        error: err,
        message: err && err.message,
      };
    }
    return props;
  },
  (dispatch, ownProps) => ({
    handleClose: () => {
      dispatch(screen.actions.closeError());
    },
    handleSubmit: (error: Error) => {
      const title = encodeURIComponent(error.message);
      const body = encodeURIComponent(`\`\`\` \n${error.stack}\n \`\`\``);
      const buttonLink = `https://emeraldwallet.io/support?title=${title}&body=${body}`;
      dispatch(screen.actions.openLink(buttonLink));
    },
  })
)(ErrorDialog);
