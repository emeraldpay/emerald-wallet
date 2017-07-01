import React from 'react';
import { connect } from 'react-redux';
import log from 'electron-log';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import { closeError } from '../store/screenActions';

const Render = ({ open, message, handleClose }) => {
    const actions = [
        <FlatButton
            label="Close"
            primary={true}
            onTouchTap={handleClose}
        />,
    ];

    return (
        <Dialog
            actions={actions}
            modal={false}
            open={open}
            onRequestClose={handleClose}
        >
            <strong>ERROR:</strong> {message}
        </Dialog>
    )
};

const Error = connect(
    (state, ownProps) => ({
        open: state.screen.get('error') !== null,
        message: state.screen.get('error'),
    }),
    (dispatch, ownProps) => ({
        handleClose: () => {
            dispatch(closeError())
        }
    })
)(Render);

export default Error;