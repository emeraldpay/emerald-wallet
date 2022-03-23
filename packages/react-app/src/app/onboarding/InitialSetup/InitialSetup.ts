import { accounts, application, screen } from '@emeraldwallet/store';
import { connect } from 'react-redux';
import InitialSetup from './InitialSetupView';

export default connect(
  (state: any, ownProps: any) => ({
    terms: application.selectors.terms(state)
  }),
  (dispatch: any, ownProps) => ({
    onTermsAgreed: async () => {
      const hasGlobalKey = await dispatch(accounts.actions.isGlobalKeySet());

      dispatch(application.actions.agreeOnTerms(ownProps.currentTermsVersion));
      dispatch(screen.actions.gotoScreen(hasGlobalKey ? screen.Pages.HOME : screen.Pages.GLOBAL_KEY));
    }
  })
)(InitialSetup);
