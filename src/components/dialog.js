import React from 'react';
import { connect } from 'react-redux';
import log from 'electron-log';

import { closeDialog } from 'store/screenActions';

import WaitForSign from './tx/waitForSignDialog';
import Receive from './accounts/ReceiveDialog';
import AboutDialog from './layout/AboutDialog';

const Render = ({ dialog, item, handleClose }) => {
    if (!dialog) {
        return <div/>;
    } else if (dialog === 'sign-transaction') {
        return <WaitForSign/>;
    } else if (dialog === 'receive') {
        return <Receive account={ item } onClose= { handleClose }/>;
    } else if (dialog === 'about') {
        return <AboutDialog onClose= { handleClose } />;
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
        handleClose: () => {
            dispatch(closeDialog());
        },
    })
)(Render);

export default Error;
