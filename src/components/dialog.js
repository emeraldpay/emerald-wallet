import React from 'react';
import { connect } from 'react-redux';

import { closeDialog } from 'store/screenActions';
import WaitForSign from './tx/waitForSignDialog';
import ReceiveDialog from './accounts/ReceiveDialog';
import AboutDialog from './layout/AboutDialog';
import createLogger from '../utils/logger';

const log = createLogger('Dialog');

const Dialog = ({ dialog, item, handleClose }) => {
    if (!dialog) {
        return <div/>;
    } else if (dialog === 'sign-transaction') {
        return <WaitForSign/>;
    } else if (dialog === 'receive') {
        return <ReceiveDialog account={ item } onClose= { handleClose }/>;
    } else if (dialog === 'about') {
        return <AboutDialog onClose= { handleClose } />;
    }
    log.error('Unsupported dialog', dialog);
    return <div/>;
};

export default connect(
    (state, ownProps) => ({
        dialog: state.screen.get('dialog'),
        item: state.screen.get('dialogItem'),
    }),
    (dispatch, ownProps) => ({
        handleClose: () => {
            dispatch(closeDialog());
        },
    })
)(Dialog);

