import { IState, screen } from '@emeraldwallet/store';
import { ErrorDialog } from '@emeraldwallet/ui';
import { connect } from 'react-redux';

export default connect(
  (state: IState) => {
    const error = screen.selectors.getError(state);

    return {
      error,
      open: error != null,
      message: error?.message,
    };
  },
  (dispatch) => ({
    handleClose: () => {
      dispatch(screen.actions.closeError());
    },
    handleSubmit: (error: Error) => {
      const title = encodeURIComponent(error.message);
      const body = encodeURIComponent(`\`\`\`\n${error.stack}\n\`\`\``);

      const link = `https://go.emrld.io/support?title=${title}&body=${body}`;

      dispatch(screen.actions.openLink(link));
    },
  }),
)(ErrorDialog);
