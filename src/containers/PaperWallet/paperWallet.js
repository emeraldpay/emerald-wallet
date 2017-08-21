import React from 'react';
import { connect } from 'react-redux';

import { gotoScreen } from '../../store/screenActions';
import PaperWallet from '../../components/accounts/PaperWallet';


export default connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({
        onCancel: () => {
            dispatch(gotoScreen('home'));
        },
    })
)(PaperWallet);
