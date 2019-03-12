import { connect } from 'react-redux';
import { Terms } from 'ui';
import launcher from '../../../store/launcher';
import { TERMS_VERSION } from '../../../store/config';

export default connect(
  (state, ownProps) => ({}),
  (dispatch, ownProps) => ({
    onAgree: () => dispatch(launcher.actions.agreeOnTerms(TERMS_VERSION)),
  })
)(Terms);
