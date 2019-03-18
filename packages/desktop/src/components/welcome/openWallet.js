import React from 'react';
import { connect } from 'react-redux';
import { OpenWallet } from '@emeraldwallet/ui';
import screen from '../../store/wallet/screen';

export default connect(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps, state) => ({
    nextPage: () => {
      const numberOfAccounts = state.accounts.get('accounts').size;
      dispatch(screen.actions.gotoScreen(numberOfAccounts === 0 ? 'landing' : 'home'));
    },
  })
)(OpenWallet);
