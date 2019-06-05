import React from 'react';
import { connect } from 'react-redux';
import { ErrorDialog} from '@emeraldwallet/ui';
import { screen } from 'store';

export default connect(
  (state, ownProps) => {
    let props = {
      open: screen.selectors.getError(state) !== null,
    };

    if (props.open) {
      const err = screen.selectors.getError(state);
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
    handleSubmit: (error) => {
      const title = encodeURIComponent(error.message);
      const body = encodeURIComponent(`\`\`\` \n${error.stack}\n \`\`\``);

      const buttonLink = `https://emeraldwallet.io/support?title=${title}&body=${body}`;

      dispatch(screen.actions.openLink(buttonLink));
    },
  })
)(ErrorDialog);
