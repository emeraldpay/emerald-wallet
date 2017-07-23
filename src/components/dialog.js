import React from 'react';
import { connect } from 'react-redux';
import log from 'electron-log';

import WaitForSign from './tx/waitForSignDialog';

const Render = ({ dialog }) => {

    if (!dialog) {
        return <div/>
    } else if (dialog === 'sign-transaction') {
        return <WaitForSign/>
    } else {
        log.error("Unsupported dialog", dialog);
        return <div/>
    }
};

const Error = connect(
    (state, ownProps) => ({
        dialog: state.screen.get('dialog'),
    }),
    (dispatch, ownProps) => ({
    })
)(Render);

export default Error;