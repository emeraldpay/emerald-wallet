import React from 'react';
import { connect } from 'react-redux';
import log from 'electron-log';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';

import { closeError } from 'store/screenActions';

const Render = ({ open, transaction, handleClose }) => {
    const actions = [
        <FlatButton
            label="Cancel"
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
            Please sign transaction using your Hardware Key<br/>
            <FontIcon className="fa fa-spinner fa-spin"/> Waiting for signature....
        </Dialog>
    )
};

const Error = connect(
    (state, ownProps) => ({
        open: state.screen.get('dialog') === 'sign-transaction',
        transaction: state.screen.get('dialogItem')
    }),
    (dispatch, ownProps) => ({
        handleClose: () => {
        }
    })
)(Render);

export default Error;