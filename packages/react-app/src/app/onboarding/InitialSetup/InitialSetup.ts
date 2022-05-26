import { application, IState, screen } from '@emeraldwallet/store';
import { connect } from 'react-redux';
import InitialSetup from './InitialSetupView';
import { DispatchProps, OwnProps, StateProps } from './InitialSetupView/InitialSetup';

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state) => (
    {
      terms: application.selectors.terms(state),
    }
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, ownProps) => (
    {
      onTermsAgreed() {
        dispatch(application.actions.agreeOnTerms(ownProps.currentTermsVersion));
        dispatch(screen.actions.gotoWalletsScreen());
      },
    }
  ),
)(InitialSetup);
