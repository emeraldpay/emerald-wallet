import React from 'react';
import { connect } from 'react-redux';
import log from 'electron-log';

import WaitForSign from './tx/waitForSignDialog';
import Receive from './accounts/receiveDialog';

const Render = ({ dialog, item }) => {
    if (!dialog) {
        return <div/>;
    } else if (dialog === 'sign-transaction') {
        return <WaitForSign/>;
    } else if (dialog === 'receive') {
        return <Receive account={item}/>;
    }
    log.error('Unsupported dialog', dialog);
    return <div/>;
};

const Error = connect(
    (state, ownProps) => ({
        dialog: state.screen.get('dialog'),
        item: state.screen.get('dialogItem'),
    }),
    (dispatch, ownProps) => ({
    })
)(Render);

export default Error;
