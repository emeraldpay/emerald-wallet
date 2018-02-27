import { connect } from 'react-redux';
import launcher from '../../../store/launcher';
import Terms from './Terms';

export default connect(
  (state, ownProps) => ({}),
  (dispatch, ownProps) => ({
    onAgree: () =>
      dispatch(launcher.actions.agreeOnTerms('v1')),
  })
)(Terms);

