import { connect } from 'react-redux';
import launcher from '../../../store/launcher';
import Terms from './Terms';
import { TERMS_VERSION } from '../../../store/config';

export default connect(
  (state, ownProps) => ({}),
  (dispatch, ownProps) => ({
    onAgree: () => dispatch(launcher.actions.agreeOnTerms(TERMS_VERSION)),
  })
)(Terms);
