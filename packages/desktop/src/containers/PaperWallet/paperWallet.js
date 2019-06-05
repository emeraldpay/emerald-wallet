import React from 'react';
import { connect } from 'react-redux';
import { PaperWallet } from '@emeraldwallet/ui';
import { screen } from 'store';

export default connect(
  (state, ownProps) => ({}),
  (dispatch, ownProps) => ({
    onCancel: () => {
      dispatch(screen.actions.gotoScreen('home'));
    },
  })
)(PaperWallet);
