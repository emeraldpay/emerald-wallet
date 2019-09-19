import { screen } from '@emeraldwallet/store';
import { PaperWallet } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';

export default connect(
  (state, ownProps) => ({}),
  (dispatch, ownProps) => ({
    onCancel: () => {
      dispatch(screen.actions.gotoScreen('home'));
    }
  })
)(PaperWallet);
