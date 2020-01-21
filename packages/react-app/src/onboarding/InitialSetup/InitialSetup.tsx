import { application, screen } from '@emeraldwallet/store';
import { InitialSetup } from '@emeraldwallet/ui';
import React from 'react';
import { connect } from 'react-redux';

export default connect(
  (state: any, ownProps: any) => ({
    terms: application.selectors.terms(state)
  }),
  (dispatch, ownProps) => ({
    onTermsAgreed: () => {
      dispatch(application.actions.agreeOnTerms(ownProps.currentTermsVersion));
      dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
    }
  })
)(InitialSetup);
