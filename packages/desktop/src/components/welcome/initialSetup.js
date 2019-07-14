import React from 'react';
import { connect } from 'react-redux';
import { InitialSetup } from '@emeraldwallet/ui';
import { screen } from '@emeraldwallet/store';
import { TERMS_VERSION } from '../../store/config';
import launcher from '../../store/launcher';

export default connect(
  (state, ownProps) => ({
    currentTermsVersion: TERMS_VERSION,
    terms: state.launcher.get('terms'),
  }),
  (dispatch, ownProps) => ({
    onTermsAgreed: () => {
      dispatch(launcher.actions.agreeOnTerms(TERMS_VERSION));
      dispatch(screen.actions.goHome());
    },
  })
)(InitialSetup);
