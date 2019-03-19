import React from 'react';
import { connect } from 'react-redux';
import { ErrorDialog} from '@emeraldwallet/ui';
import screen from 'store/wallet/screen';

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

      const buttonLink = `https://emeraldwallet.io/support?title=${title}&body=${body}`;

      dispatch(screen.actions.openLink(buttonLink));
    },
  })
)(ErrorDialog);
