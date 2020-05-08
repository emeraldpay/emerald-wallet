import { application, screen } from '@emeraldwallet/store';
import React from 'react';
import { connect } from 'react-redux';
import InitialSetup from './InitialSetupView';

export default connect(
  (state: any, ownProps: any) => ({
    terms: application.selectors.terms(state)
  }),
  (dispatch: any, ownProps) => ({
    onTermsAgreed: () => {
      dispatch(application.actions.agreeOnTerms(ownProps.currentTermsVersion));
      dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
    }
  })
)(InitialSetup);
