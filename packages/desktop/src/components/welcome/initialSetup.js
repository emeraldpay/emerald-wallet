import React from 'react';
import { connect } from 'react-redux';
import { InitialSetup } from '@emeraldwallet/ui';
import { screen } from '@emeraldwallet/store';
import launcher from '../../store/launcher';

export default connect(
  (state, ownProps) => ({
    terms: state.launcher.get('terms'),
  }),
  (dispatch, ownProps) => ({
    onTermsAgreed: () => {
      dispatch(launcher.actions.agreeOnTerms(ownProps.currentTermsVersion));
      dispatch(screen.actions.goHome());
    },
  })
)(InitialSetup);
