import React from 'react';
import { connect } from 'react-redux';

import screen from 'store/wallet/screen';
import PaperWallet from '../../components/accounts/PaperWallet';


export default connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({
        onCancel: () => {
            dispatch(screen.actions.gotoScreen('home'));
        },
    })
)(PaperWallet);
