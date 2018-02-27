
import { connect } from 'react-redux';
import { showDialog } from '../../../store/wallet/screen/screenActions';

import Footer from './footer';

export default connect(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps) => ({
    handleAbout: () => {
      dispatch(showDialog('about'));
    },
  })
)(Footer);
