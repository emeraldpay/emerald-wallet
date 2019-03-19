import React from 'react';
import { connect } from 'react-redux';
import { OpenWallet } from '@emeraldwallet/ui';
import Wallet from '../../store/wallet';

export default connect(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps) => ({
    nextPage: () => {
      dispatch(Wallet.actions.onOpenWallet());
    },
  })
)(OpenWallet);
